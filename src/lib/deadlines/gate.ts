/**
 * src/lib/deadlines/gate.ts
 *
 * Pro/Free ゲートに関する共通ユーティリティ。
 * 同じロジックが route.ts / billing/page.tsx に重複しないよう一箇所に集約する。
 */
import { prisma } from "@/lib/prisma";
import { FREE_ITEM_LIMIT } from "@/config/plans";

export { FREE_ITEM_LIMIT };

/**
 * subscriptions レコードを見て Pro か判定する。
 *
 * Pro 判定: plan = "pro" かつ 以下のいずれかを満たす
 *   - status = "active" または "trialing"
 *   - current_period_end が現在より未来
 */
export async function isProUser(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub || sub.plan !== "pro") return false;
  const activeStatus = sub.status === "active" || sub.status === "trialing";
  const periodValid =
    sub.currentPeriodEnd !== null && sub.currentPeriodEnd > new Date();
  return activeStatus || periodValid;
}

/**
 * ユーザーの現在プランを返す。
 * UI表示用途に "free" | "pro" の文字列型で返す。
 */
export async function getUserPlan(userId: string): Promise<"free" | "pro"> {
  return (await isProUser(userId)) ? "pro" : "free";
}
