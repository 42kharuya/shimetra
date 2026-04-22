/**
 * POST /api/stripe/portal
 *
 * Stripe Customer Portal Session を作成し、ポータルページの URL を返すAPI。
 * Pro ユーザーが解約・支払い方法変更などをStripeに委譲するための導線。
 *
 * 認証:
 *  - セッションクッキーが必要（未ログインは 401）
 *
 * 前提:
 *  - subscriptions テーブルに stripe_customer_id が存在することが必要
 *  - stripe_customer_id が未設定の場合は 400 を返す（Checkout を先に完了させる）
 *
 * 環境変数:
 *  - STRIPE_SECRET_KEY: Stripe シークレットキー（必須）
 *  - APP_URL: リダイレクト先の基底URL（必須）
 *
 * リクエスト: なし（Body 不要）
 *
 * レスポンス:
 *  - { ok: true, url: string }  200  Stripe Customer Portal URL
 *  - { error: string }          400  stripe_customer_id 未設定
 *  - { error: string }          401  未認証
 *  - { error: string }          405  GET不可
 *  - { error: string }          500  サーバーエラー
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

/** GET は許可しない */
export function GET() {
  return NextResponse.json(
    { error: "このエンドポイントは POST のみ受け付けます。" },
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

    // 2. APP_URL 取得
    const appUrl = env.APP_URL;

    // 3. stripe_customer_id を取得
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Stripe カスタマー情報が見つかりません。先にプランのアップグレードをおこなってください。" },
        { status: 400 },
      );
    }

    // 4. Customer Portal Session 作成
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    return NextResponse.json({ ok: true, url: portalSession.url });
  } catch (err) {
    console.error("[POST /api/stripe/portal] unexpected error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
