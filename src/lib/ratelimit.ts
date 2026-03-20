/**
 * src/lib/ratelimit.ts
 *
 * Magic Link 送信エンドポイント向けレートリミッター
 *
 * - Upstash Redis + @upstash/ratelimit を使用（Cloudflare Workers 対応）
 * - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN が未設定の場合は
 *   制限をスキップする（ローカル開発・テスト向け）
 * - しきい値は環境変数でオーバーライド可能
 *   RATE_LIMIT_MAGIC_LINK_MAX        : 許容リクエスト数（デフォルト: 5）
 *   RATE_LIMIT_MAGIC_LINK_WINDOW_SEC : ウィンドウ幅（秒、デフォルト: 600 = 10分）
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── しきい値定数（環境変数でオーバーライド可能） ─────────────────────────────

/** 許容リクエスト数（デフォルト: 5回） */
export const RATE_LIMIT_MAGIC_LINK_MAX = parseInt(
  process.env.RATE_LIMIT_MAGIC_LINK_MAX ?? "5",
  10,
);

/** ウィンドウ幅（秒、デフォルト: 600秒 = 10分） */
export const RATE_LIMIT_MAGIC_LINK_WINDOW_SEC = parseInt(
  process.env.RATE_LIMIT_MAGIC_LINK_WINDOW_SEC ?? "600",
  10,
);

// ── ファクトリ ────────────────────────────────────────────────────────────

function createRatelimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Upstash 未設定 → 制限なし（ローカル開発はスキップ）
    return null;
  }

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_MAGIC_LINK_MAX,
      `${RATE_LIMIT_MAGIC_LINK_WINDOW_SEC} s`,
    ),
    prefix: "rl:magic-link",
    analytics: false, // Upstash Insights は使わない（本番で必要なら true に）
  });
}

/** Magic Link 送信用レートリミッター（Upstash 未設定時は null） */
export const magicLinkRatelimiter = createRatelimiter();

// ── 公開 API ──────────────────────────────────────────────────────────────

export type RateLimitResult =
  | { limited: false }
  | { limited: true; reset: number };

/**
 * Magic Link 送信のレート制限チェック。
 *
 * @param identifier - 制限キー（通常は IP アドレス）
 * @returns `{ limited: false }` または `{ limited: true, reset: number }`
 *          `reset` = 制限リセット時刻（Unix ミリ秒）
 */
export async function checkMagicLinkRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  if (!magicLinkRatelimiter) {
    // Upstash 未設定 → 制限なし
    return { limited: false };
  }

  const { success, reset } = await magicLinkRatelimiter.limit(identifier);
  if (success) return { limited: false };
  return { limited: true, reset };
}

/**
 * リクエストから識別子（IP アドレス）を抽出する。
 * Cloudflare Workers では CF-Connecting-IP が最優先。
 *
 * @param req - NextRequest
 * @returns IP 文字列（取得不能時は "unknown"）
 */
export function getIdentifier(req: { headers: { get(name: string): string | null } }): string {
  // Cloudflare Workers: CF-Connecting-IP（最優先）
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;

  // x-forwarded-for（クライアント IP が先頭）
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  // x-real-ip（一部プロキシ）
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
