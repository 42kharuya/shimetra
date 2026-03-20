/**
 * Stripe クライアント ファクトリ
 *
 * - STRIPE_SECRET_KEY 環境変数が必須（未設定時は呼び出し時にエラー）
 * - Node.js ランタイム専用（Edge Runtime では使用不可）
 * - getStripe() を呼び出すまで初期化されない（遅延初期化）
 */
import Stripe from "stripe";
import { env } from "@/lib/env";

function getStripeClient(): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY);
}

// 遅延初期化シングルトン（モジュール読み込み時には初期化しない）
const globalForStripe = globalThis as unknown as { stripe?: Stripe };

export function getStripe(): Stripe {
  if (!globalForStripe.stripe) {
    globalForStripe.stripe = getStripeClient();
  }
  return globalForStripe.stripe;
}
