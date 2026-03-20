/**
 * POST /api/cron/notify
 *
 * 通知 Cron エンドポイント（ADR 0004 / 0005 準拠）
 *
 * 処理フロー:
 *  1. CRON_SECRET で認証（Authorization: Bearer <secret>）
 *  2. 現在ウィンドウ内の通知対象を抽出し、notification_deliveries を upsert
 *  3. status=scheduled のレコードにメール送信し、成否で status を更新する
 *
 * 環境変数:
 *  CRON_SECRET  Cron 呼び出し用シークレット（必須）
 *               wrangler secret put CRON_SECRET で登録する
 *
 * 呼び出し方（例）:
 *  curl -X POST http://localhost:3000/api/cron/notify \
 *    -H "Authorization: Bearer <CRON_SECRET>"
 *
 * レスポンス:
 *  { ok: true, result: NotifyResult }   200  全件成功（または全スキップ）
 *  { ok: true, result: NotifyResult }   207  部分失敗（一部メール送信失敗。failed > 0）
 *  { error: string }                    401  認証失敗
 *  { error: string }                    500  サーバーエラー（予期しない例外）
 *
 * Cloudflare Cron 設定（wrangler.toml）:
 *  [triggers]
 *  crons = ["* /10 * * * *"]
 *  ※ schedule: 10分間隔（"星印/10 * * * *"形式、JSDoc上の都合でスペース挿入済み）
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { findAndDeliverNotifications } from "@/features/notifications/notify";
import { env } from "@/lib/env";

/** GET は許可しない */
export function GET() {
  return NextResponse.json(
    { error: "このエンドポイントは POST のみ受け付けます。" },
    { status: 405 },
  );
}

export async function POST(req: NextRequest) {
  // 1. CRON_SECRET 認証
  let cronSecret: string;
  try {
    cronSecret = env.CRON_SECRET;
  } catch {
    console.error("[cron/notify] CRON_SECRET が設定されていません");
    return NextResponse.json(
      { error: "サーバー設定エラー: CRON_SECRET が未設定です" },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  // タイミング攻撃対策: 長さが違っても timingSafeEqual 相当の比較を行う
  if (!timingSafeEqual(token, cronSecret)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  // 2. 通知処理
  try {
    const result = await findAndDeliverNotifications();
    console.log("[cron/notify] 完了", result);
    // 部分失敗（failed > 0）は 207 Multi-Status で返す
    const status = result.failed > 0 ? 207 : 200;
    return NextResponse.json({ ok: true, result }, { status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/notify] エラー:", message);
    return NextResponse.json(
      { error: `通知処理エラー: ${message}` },
      { status: 500 },
    );
  }
}

/**
 * タイミング攻撃を緩和するための文字列比較。
 * Node.js の crypto.timingSafeEqual は EdgeRuntime では使えないため、
 * 長さを統一してから XOR 比較する簡易実装を使う。
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // 長さが違う場合も全体を走査してタイミングを均一化
    let diff = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return false; // 長さ不一致は必ず false
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
