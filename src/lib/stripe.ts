/**
 * Stripe クライアント シングルトン
 *
 * - STRIPE_SECRET_KEY 環境変数が必須（未設定時は起動エラー）
 * - Node.js ランタイム専用（Edge Runtime では使用不可）
 */
import Stripe from "stripe";

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env");
  }
  return new Stripe(secretKey);
}

// シングルトン（モジュールキャッシュ活用）
const globalForStripe = globalThis as unknown as { stripe?: Stripe };

export const stripe: Stripe =
  globalForStripe.stripe ?? getStripeClient();

if (process.env.NODE_ENV !== "production") {
  globalForStripe.stripe = stripe;
}
