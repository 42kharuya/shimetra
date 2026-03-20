/**
 * POST /api/stripe/webhook
 *
 * Stripe から送信される Webhook イベントを受け取り、課金状態を DB に同期する。
 *
 * 処理フロー:
 *  1. Stripe 署名を検証（STRIPE_WEBHOOK_SECRET 環境変数）
 *  2. イベント種別に応じて subscriptions テーブルを冪等に upsert する
 *
 * 対応イベント:
 *  - customer.subscription.created
 *  - customer.subscription.updated
 *  - customer.subscription.deleted
 *
 * 環境変数:
 *  - STRIPE_SECRET_KEY: Stripe シークレットキー（必須）
 *  - STRIPE_WEBHOOK_SECRET: Webhook エンドポイントの署名シークレット（必須）
 *    ローカル: stripe listen --forward-to localhost:3000/api/stripe/webhook で取得した whsec_xxx
 *    本番: Stripe Dashboard > Developers > Webhooks で確認
 *
 * リクエスト:
 *  - Content-Type: application/json（raw body が必要）
 *  - Stripe-Signature ヘッダー必須
 *
 * レスポンス:
 *  - { ok: true }         200  正常処理（またはスキップ）
 *  - { error: string }    400  署名検証失敗
 *  - { error: string }    500  サーバーエラー
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { upsertSubscription } from "@/lib/stripe/webhook";
import { trackEvent } from "@/lib/analytics";
import { env } from "@/lib/env";
import type Stripe from "stripe";

/** GET は許可しない */
export function GET() {
  return NextResponse.json(
    { error: "このエンドポイントは Stripe からの POST のみ受け付けます。" },
    { status: 405 },
  );
}

export async function POST(req: NextRequest) {
  // 1. raw body の取得（署名検証に必要）
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Stripe-Signature ヘッダーがありません" },
      { status: 400 },
    );
  }

  // 2. 署名検証
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] 署名検証失敗: %s", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  // 3. イベント処理
  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const result = await upsertSubscription(subscription);

        // purchase: 新規サブスクが作成されたとき（初回課金確定）に限り1回送信
        // PIIを含めない（amount/currency は固定値）
        if (
          event.type === "customer.subscription.created" &&
          result?.plan === "pro"
        ) {
          await trackEvent({
            name: "purchase",
            userId: result.userId,
            plan: "pro_monthly",
            amount: 980,
            currency: "JPY",
          });
        }
        break;
      }
      default:
        // 対象外イベントは無視（200 を返して Stripe に再送させない）
        console.info("[webhook] unhandled event type: %s", event.type);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] イベント処理エラー: %s", message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
