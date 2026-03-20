/**
 * POST /api/stripe/checkout
 *
 * Stripe Checkout Session を作成し、決済ページの URL を返すAPI。
 *
 * 認証:
 *  - セッションクッキーが必要（未ログインは 401）
 *
 * 環境変数:
 *  - STRIPE_SECRET_KEY: Stripe シークレットキー（必須）
 *  - STRIPE_PRICE_ID: Pro プランの Price ID（必須）
 *  - APP_URL: リダイレクト先の基底URL（必須）
 *
 * リクエスト: なし（Body 不要）
 *
 * レスポンス:
 *  - { ok: true, url: string }  200  Stripe Checkout URL
 *  - { error: string }          401 / 405 / 500
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

/** GET は許可しない（ブラウザで直接開いた場合に分かりやすいエラーを返す） */
export function GET() {
  return NextResponse.json(
    { error: "このエンドポイントは POST のみ受け付けます。/billing からアップグレードしてください。" },
    { status: 405 },
  );
}

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
    const email = session.email;

    // 2. 環境変数取得
    const priceId = env.STRIPE_PRICE_ID;
    const appUrl = env.APP_URL;

    // 3. 既存の stripe_customer_id を取得（あれば再利用）
    const existingSub = await prisma.subscription.findUnique({
      where: { userId },
    });
    const stripeCustomerId = existingSub?.stripeCustomerId ?? undefined;

    // 4. Checkout Session 作成
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // subscription_data.metadata に設定することで
      // Subscription オブジェクトに userId が引き継がれ、webhook で参照できる
      subscription_data: {
        metadata: {
          userId,
        },
      },
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing/cancel`,
    });

    if (!checkoutSession.url) {
      console.error("[POST /api/stripe/checkout] session.url is null", {
        sessionId: checkoutSession.id,
      });
      return NextResponse.json(
        { error: "Checkout URL の取得に失敗しました" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, url: checkoutSession.url });
  } catch (err) {
    console.error("[POST /api/stripe/checkout] unexpected error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
