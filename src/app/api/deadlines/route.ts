/**
 * GET /api/deadlines
 *
 * ログインユーザーの締切アイテムを deadline_at 昇順（近い順）で取得するAPI。
 *
 * 認証:
 *  - セッションクッキーが必要（未ログインは 401）
 *  - 自分のアイテムのみ返す（userId で必ずフィルタ）
 *
 * レスポンス:
 *  - { ok: true, items: DeadlineItem[] }  200
 *  - { error: string }                    401 / 500
 *
 * ----
 *
 * POST /api/deadlines
 *
 * 締切アイテムを作成するAPI。
 *
 * 認証:
 *  - セッションクッキーが必要（未ログインは 401）
 *  - 作成者は必ずログインユーザー（他ユーザーへの書き込み不可）
 *
 * バリデーション（src/lib/deadlines/validate.ts 参照）:
 *  - company_name: 必須、1〜100 文字
 *  - kind: 必須、"es" | "briefing" | "interview" | "other"
 *  - deadline_at: 必須、ISO 8601 文字列
 *  - status: 任意、デフォルト "todo"
 *  - link: 任意、http(s) URL、最大 2048 文字
 *  - memo: 任意、最大 1000 文字
 *
 * Free 枠制限:
 *  - Pro ユーザー（subscriptions.plan = "pro" かつ active/trialing または current_period_end が未来）は無制限
 *  - それ以外（Free）は 10 件まで。超過時は 403 を返す
 */

export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { prisma } from "@/lib/prisma";
import { validateCreateDeadline } from "@/features/deadlines/validate";
import { FREE_ITEM_LIMIT, isProUser } from "@/features/deadlines/gate";
import { trackEvent } from "@/features/analytics";

export async function POST(req: NextRequest) {
  try {
    // 1. 認証確認
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }
    const userId = session.sub;

    // 2. バリデーション
    const body = await req.json().catch(() => ({}));
    const result = validateCreateDeadline(body);
    if (!result.ok) {
      return NextResponse.json(
        { error: "入力値が不正です", details: result.errors },
        { status: 400 },
      );
    }
    const { companyName, kind, deadlineAt, status, link, memo } = result.data;

    // 3. Free 枠チェック
    const pro = await isProUser(userId);
    if (!pro) {
      const count = await prisma.deadlineItem.count({ where: { userId } });
      if (count >= FREE_ITEM_LIMIT) {
        return NextResponse.json(
          {
            error: `Free プランは最大 ${FREE_ITEM_LIMIT} 件まで登録できます。Pro にアップグレードすると無制限になります。`,
            code: "FREE_LIMIT_EXCEEDED",
          },
          { status: 403 },
        );
      }
    }

    // 4. 作成（userId を強制指定してユーザースコープを保証）
    const item = await prisma.deadlineItem.create({
      data: {
        userId,
        companyName,
        kind,
        deadlineAt,
        status,
        link,
        memo,
      },
    });

    // 5. Activation チェック（サインアップ後24h以内に2件作成した瞬間に1回だけ）
    await checkAndTrackActivation(userId, item.createdAt);

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/deadlines] unexpected error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1. 認証確認
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }
    const userId = session.sub;

    // 2. ログインユーザーのアイテムのみ取得（deadline_at 昇順）
    const items = await prisma.deadlineItem.findMany({
      where: { userId },
      orderBy: { deadlineAt: "asc" },
    });

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[GET /api/deadlines] unexpected error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------
// Activation チェック
// ---------------------------------------------------------------

const ACTIVATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
const ACTIVATION_ITEM_COUNT = 2;

/**
 * サインアップ後24h以内に締切アイテムをACTIVATION_ITEM_COUNT件作成した瞬間（=ちょうど2件目）に
 * activation イベントを1回だけ送信する。
 *
 * - カウントは作成済みを含む（今回作成したアイテムも含む）
 * - count === ACTIVATION_ITEM_COUNT の場合のみ送信（超過後は送らない）
 */
async function checkAndTrackActivation(
  userId: string,
  itemCreatedAt: Date,
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    if (!user) return;

    const signupTime = user.createdAt;
    const windowEnd = new Date(signupTime.getTime() + ACTIVATION_WINDOW_MS);

    // ユーザーがすでに24hウィンドウ外の場合はスキップ
    if (itemCreatedAt > windowEnd) return;

    // サインアップ後24h以内に作成されたアイテム数を集計
    const countWithin24h = await prisma.deadlineItem.count({
      where: {
        userId,
        createdAt: { gte: signupTime, lte: windowEnd },
      },
    });

    if (countWithin24h === ACTIVATION_ITEM_COUNT) {
      const timeToValueSeconds = Math.floor(
        (itemCreatedAt.getTime() - signupTime.getTime()) / 1000,
      );
      await trackEvent({
        name: "activation",
        userId,
        definition: "two_items_within_24h",
        time_to_value_seconds: timeToValueSeconds,
      });
    }
  } catch (err) {
    console.error("[POST /api/deadlines] activation check error:", err);
  }
}
