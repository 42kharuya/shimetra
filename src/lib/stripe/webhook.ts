/**
 * Stripe Webhook ユーティリティ
 *
 * - subscriptions テーブルへの冪等 upsert
 * - Pro 判定ルール: status が active/trialing、または current_period_end が未来
 */
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

/**
 * Stripe Subscription オブジェクトから plan を判定する。
 *
 * Pro 条件（いずれかを満たせば pro）:
 *  1. status が "active" または "trialing"
 *  2. current_period_end が現在時刻より未来（猶予期間中のアクセス継続）
 */
export function resolveSubscriptionPlan(
  status: string,
  currentPeriodEnd: Date | null,
): "free" | "pro" {
  if (status === "active" || status === "trialing") {
    return "pro";
  }
  if (currentPeriodEnd && currentPeriodEnd > new Date()) {
    return "pro";
  }
  return "free";
}

/**
 * Stripe の Subscription オブジェクトを subscriptions テーブルへ冪等に upsert する。
 *
 * upsert キー: stripe_subscription_id（Stripe側でユニーク）
 * userId は subscription.metadata.userId（Checkout Session 作成時に埋め込み）から取得。
 * userId が存在しない場合は処理をスキップし、エラーをログに残す。
 */
export async function upsertSubscription(
  subscription: Stripe.Subscription,
): Promise<void> {
  // metadata.userId は Checkout Session 作成時に埋め込む（checkout/route.ts 参照）
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error(
      "[webhook] upsertSubscription: userId not found in metadata. subscriptionId=%s",
      subscription.id,
    );
    return;
  }

  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  // Stripe SDK v20 では current_period_end は SubscriptionItem に移動
  const firstItem = subscription.items.data[0];
  const currentPeriodEnd =
    firstItem?.current_period_end != null
      ? new Date(firstItem.current_period_end * 1000)
      : null;

  const plan = resolveSubscriptionPlan(subscription.status, currentPeriodEnd);

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      plan,
      currentPeriodEnd,
    },
    update: {
      stripeCustomerId,
      status: subscription.status,
      plan,
      currentPeriodEnd,
    },
  });

  console.info(
    "[webhook] subscription upserted: id=%s userId=%s status=%s plan=%s",
    subscription.id,
    userId,
    subscription.status,
    plan,
  );
}
