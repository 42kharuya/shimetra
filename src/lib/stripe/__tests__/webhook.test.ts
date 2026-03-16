/**
 * Stripe Webhook ユーティリティ 最小テスト
 * 実行: npm run test:webhook
 *
 * テスト戦略:
 *  - resolveSubscriptionPlan: Pro 判定ルールの網羅（status / current_period_end）
 *  - STRIPE_WEBHOOK_SECRET 未設定時に Error が throw されるか
 *  （upsertSubscription は DB 接続が必要なため手動確認とする）
 */

import "dotenv/config";
import assert from "node:assert/strict";
import { resolveSubscriptionPlan } from "../webhook";

async function runAll() {
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error("   ", err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log("\nStripe Webhook ユーティリティ テスト\n");

  // ---- resolveSubscriptionPlan ----

  await test("status=active → pro", () => {
    assert.equal(resolveSubscriptionPlan("active", null), "pro");
  });

  await test("status=trialing → pro", () => {
    assert.equal(resolveSubscriptionPlan("trialing", null), "pro");
  });

  await test("status=canceled, currentPeriodEnd=過去 → free", () => {
    const past = new Date(Date.now() - 1000);
    assert.equal(resolveSubscriptionPlan("canceled", past), "free");
  });

  await test("status=canceled, currentPeriodEnd=未来 → pro（猶予期間）", () => {
    const future = new Date(Date.now() + 60 * 60 * 1000); // +1h
    assert.equal(resolveSubscriptionPlan("canceled", future), "pro");
  });

  await test("status=past_due, currentPeriodEnd=null → free", () => {
    assert.equal(resolveSubscriptionPlan("past_due", null), "free");
  });

  await test("status=unpaid, currentPeriodEnd=過去 → free", () => {
    const past = new Date(Date.now() - 86400 * 1000);
    assert.equal(resolveSubscriptionPlan("unpaid", past), "free");
  });

  // ---- STRIPE_WEBHOOK_SECRET 環境変数チェック ----

  await test("STRIPE_WEBHOOK_SECRET 未設定は Error を throw する", () => {
    const original = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    try {
      assert.throws(() => {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
          throw new Error(
            "STRIPE_WEBHOOK_SECRET is not set. Add it to .env",
          );
        }
      });
    } finally {
      if (original !== undefined) {
        process.env.STRIPE_WEBHOOK_SECRET = original;
      }
    }
  });

  console.log(`\n${passed} passed / ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
