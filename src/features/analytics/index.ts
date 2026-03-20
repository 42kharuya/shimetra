/**
 * src/lib/analytics/index.ts
 *
 * サーバーサイド専用の最小計測基盤
 * - PII（メールアドレス等）は含めない
 * - イベント名は snake_case（ANALYTICS_SPEC.md 準拠）
 *
 * 環境変数:
 *  ANALYTICS_PROVIDER : "console" (デフォルト) | "segment"
 *  ANALYTICS_WRITE_KEY: Segment Write Key（ANALYTICS_PROVIDER=segment のとき必須）
 */

import { env } from "@/lib/env";

// ---------------------------------------------------------------
// イベント型定義（ANALYTICS_SPEC.md に対応）
// ---------------------------------------------------------------

export interface SignupEvent {
  name: "signup";
  userId: string;
  method: string;
}

export interface ActivationEvent {
  name: "activation";
  userId: string;
  definition: string;
  time_to_value_seconds?: number;
}

export interface DashboardViewedEvent {
  name: "dashboard_viewed";
  userId: string;
}

export interface PurchaseEvent {
  name: "purchase";
  userId: string;
  plan: string;
  amount: number;
  currency: string;
}

export type AnalyticsEvent =
  | SignupEvent
  | ActivationEvent
  | DashboardViewedEvent
  | PurchaseEvent;

// ---------------------------------------------------------------
// 公開 API
// ---------------------------------------------------------------

/**
 * 計測イベントを送信する。
 *
 * - 送信失敗はコア処理に影響させない（エラーをキャッチしてログのみ）
 * - NODE_ENV=test のときは silent（console 出力なし）
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await doTrack(event);
  } catch (err) {
    // 計測失敗はコア処理に影響させない
    console.error("[analytics] trackEvent error:", err);
  }
}

// ---------------------------------------------------------------
// 内部実装
// ---------------------------------------------------------------

async function doTrack(event: AnalyticsEvent): Promise<void> {
  const provider = env.ANALYTICS_PROVIDER;

  if (env.NODE_ENV === "test") {
    // テスト時は出力しない（spy で検証できるよう素通り）
    return;
  }

  if (provider === "console") {
    console.log("[analytics] %s", event.name, JSON.stringify(event));
    return;
  }

  if (provider === "segment") {
    const writeKey = env.ANALYTICS_WRITE_KEY;
    if (!writeKey) {
      console.warn(
        "[analytics] ANALYTICS_WRITE_KEY is not set. Skipping Segment track.",
      );
      return;
    }
    await trackSegment(writeKey, event);
    return;
  }

  console.warn("[analytics] unknown ANALYTICS_PROVIDER: %s", provider);
}

/**
 * Segment HTTP Tracking API v1 へイベントを送信する。
 * 追加 SDK 依存なし（fetch のみ）。
 *
 * @see https://segment.com/docs/connections/sources/catalog/libraries/server/http-api/
 */
async function trackSegment(
  writeKey: string,
  event: AnalyticsEvent,
): Promise<void> {
  const { name, userId, ...properties } = event;
  const authorization = Buffer.from(`${writeKey}:`).toString("base64");

  const res = await fetch("https://api.segment.io/v1/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authorization}`,
    },
    body: JSON.stringify({
      userId,
      event: name,
      properties,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    console.error(
      "[analytics] Segment track failed: status=%s body=%s",
      res.status,
      text,
    );
  }
}
