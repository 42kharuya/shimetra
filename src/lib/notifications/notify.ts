/**
 * src/lib/notifications/notify.ts
 *
 * 通知 Cron のコアロジック（ADR 0005 準拠）
 *
 * 設計方針:
 *  - Free=24h前 (offset_minutes=1440)、Pro=72h/24h/3h前 (offset_minutes=4320/1440/180)
 *  - Cron 実行ごとに「ウィンドウ内に scheduled_for が入る対象」を抽出する
 *  - 送信前に notification_deliveries を upsert（一意制約で重複作成を防止）
 *  - status=scheduled のレコードのみを実際に送信し、成否で sent/failed に更新する
 *
 * ウィンドウ設計:
 *  - scheduled_for = deadline_at - offset_minutes
 *  - ウィンドウ: now() - CRON_WINDOW_MINUTES <= scheduled_for <= now() + CRON_WINDOW_MINUTES
 *  - Cron 間隔（5〜10分）に合わせて取りこぼしをリカバリする
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { sendEmail } from "@/lib/mailer";
import { isProUser } from "@/lib/deadlines/gate";

/** Free プランの通知オフセット（分） */
export const OFFSETS_FREE: number[] = [1440]; // 24h

/** Pro プランの通知オフセット（分） */
export const OFFSETS_PRO: number[] = [4320, 1440, 180]; // 72h / 24h / 3h

/** Cron ウィンドウ幅（分）: この範囲内の scheduled_for を持つレコードを対象とする */
export const CRON_WINDOW_MINUTES = 10;

/** 通知送信の結果サマリー */
export interface NotifyResult {
  processed: number; // 処理した (item, offset) ペア数
  sent: number;
  failed: number;
  skipped: number; // 既に sent/failed だったためスキップ
}

/** scheduled_for からオフセットのラベルを返す（メール件名用） */
export function offsetLabel(offsetMinutes: number): string {
  if (offsetMinutes === 4320) return "72時間";
  if (offsetMinutes === 1440) return "24時間";
  if (offsetMinutes === 180) return "3時間";
  return `${offsetMinutes}分`;
}

/**
 * 通知メールの HTML を生成する。
 * 将来的にテンプレートファイルへ移行できるよう関数として分離する。
 */
export function buildNotificationHtml(params: {
  companyName: string;
  kind: string;
  deadlineAt: Date;
  offsetMinutes: number;
  appUrl: string;
}): { subject: string; html: string; text: string } {
  const { companyName, kind, deadlineAt, offsetMinutes, appUrl } = params;
  const label = offsetLabel(offsetMinutes);

  // JST 変換（JSTはUTC+9）
  const deadlineJst = new Date(deadlineAt.getTime() + 9 * 60 * 60 * 1000);
  const deadlineStr = deadlineJst
    .toISOString()
    .replace("T", " ")
    .replace(/\..*$/, "")
    .slice(0, 16); // "YYYY-MM-DD HH:MM"

  const kindLabels: Record<string, string> = {
    es: "ES",
    briefing: "説明会",
    interview: "面接",
    other: "その他",
  };
  const kindLabel = kindLabels[kind] ?? kind;

  const subject = `【締切${label}前】${companyName}（${kindLabel}）`;
  const html = `
<p>締切まで<strong>${label}</strong>です。</p>
<p><strong>${companyName}</strong>（${kindLabel}）の締切は <strong>${deadlineStr} JST</strong> です。</p>
<p><a href="${appUrl}/dashboard">ダッシュボードで確認する →</a></p>
<hr>
<p style="font-size:12px;color:#888;">
  通知設定の変更は <a href="${appUrl}/billing">こちら</a>。
  このメールは就活締切トラッカーから自動送信されています。
</p>
`.trim();
  const text = `締切まで${label}です。\n${companyName}（${kindLabel}）の締切: ${deadlineStr} JST\n\nダッシュボード: ${appUrl}/dashboard`;

  return { subject, html, text };
}

/**
 * 通知 Cron のメイン処理。
 *
 * 1. 現在ウィンドウ内で通知すべき (DeadlineItem, offsetMinutes) ペアを収集する
 * 2. 各ペアの notification_delivery を upsert（重複防止）
 * 3. status=scheduled のレコードにメール送信
 * 4. 成否で status を sent/failed に更新する
 */
export async function findAndDeliverNotifications(): Promise<NotifyResult> {
  const now = new Date();
  const windowMs = CRON_WINDOW_MINUTES * 60 * 1000;
  const maxOffsetMs = Math.max(...OFFSETS_PRO) * 60 * 1000;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  // ウィンドウ内に scheduled_for (= deadline_at - offset) が入り得る
  // deadline_at の範囲: now - WINDOW + minOffset <= deadline_at <= now + WINDOW + maxOffset
  // シンプルに: deadline_at が now-WINDOW ~ now+maxOffset+WINDOW の間にある全 active アイテムを取得
  const deadlineFrom = new Date(now.getTime() - windowMs);
  const deadlineTo = new Date(now.getTime() + maxOffsetMs + windowMs);

  // withAccelerate() 拡張型で include の型推論が崩れるため明示的に型付け
  const items = (await prisma.deadlineItem.findMany({
    where: {
      deadlineAt: { gte: deadlineFrom, lte: deadlineTo },
      // done/canceled は通知不要
      status: { notIn: ["done", "canceled"] },
    },
    include: {
      user: true,
    },
  })) as Prisma.DeadlineItemGetPayload<{ include: { user: true } }>[];

  const result: NotifyResult = {
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  // isProUser のキャッシュ: 同一 userId への重複 DB クエリを防ぐ（N+1対策）
  const proCache = new Map<string, boolean>();
  async function isProUserCached(userId: string): Promise<boolean> {
    if (proCache.has(userId)) return proCache.get(userId)!;
    const result = await isProUser(userId);
    proCache.set(userId, result);
    return result;
  }

  for (const item of items) {
    // ユーザーのプランに応じてオフセットを決定
    const isPro = await isProUserCached(item.userId);
    const offsets = isPro ? OFFSETS_PRO : OFFSETS_FREE;

    for (const offsetMinutes of offsets) {
      // scheduled_for = deadline_at - offset_minutes
      const scheduledFor = new Date(
        item.deadlineAt.getTime() - offsetMinutes * 60 * 1000,
      );

      // このオフセットが現在ウィンドウ内に入るか確認
      const windowStart = new Date(now.getTime() - windowMs);
      const windowEnd = new Date(now.getTime() + windowMs);
      if (scheduledFor < windowStart || scheduledFor > windowEnd) {
        continue; // ウィンドウ外はスキップ
      }

      result.processed++;

      // notification_delivery を upsert（一意制約: deadline_item_id + offset_minutes）
      // update: {} にして既存レコードは変更しない（重複防止）
      const delivery = await prisma.notificationDelivery.upsert({
        where: {
          uq_notification_deliveries_item_offset: {
            deadlineItemId: item.id,
            offsetMinutes,
          },
        },
        create: {
          deadlineItemId: item.id,
          offsetMinutes,
          scheduledFor,
          status: "scheduled",
        },
        update: {}, // 既存があればそのまま（重複防止）
      });

      // status=scheduled のもののみ送信（sent/failed はスキップ）
      if (delivery.status !== "scheduled") {
        result.skipped++;
        continue;
      }

      // メール送信
      const { subject, html, text } = buildNotificationHtml({
        companyName: item.companyName,
        kind: item.kind,
        deadlineAt: item.deadlineAt,
        offsetMinutes,
        appUrl,
      });

      const sendResult = await sendEmail({
        to: item.user.email,
        subject,
        html,
        text,
      });

      if (sendResult.ok) {
        await prisma.notificationDelivery.update({
          where: { id: delivery.id },
          data: {
            status: "sent",
            sentAt: now,
            providerMessageId: sendResult.messageId ?? null,
          },
        });
        result.sent++;
        console.log("[notify] sent", {
          deadlineItemId: item.id,
          offsetMinutes,
          to: item.user.email,
        });
      } else {
        await prisma.notificationDelivery.update({
          where: { id: delivery.id },
          data: {
            status: "failed",
            error: sendResult.error,
          },
        });
        result.failed++;
        console.error("[notify] failed", {
          deadlineItemId: item.id,
          offsetMinutes,
          error: sendResult.error,
        });
      }
    }
  }

  return result;
}
