/**
 * analytics 最小テスト
 * 実行: npm run test:analytics
 *
 * テスト戦略:
 *  - trackEvent が Promise<void> を返し throw しないこと
 *  - ANALYTICS_PROVIDER=console のとき console.log が呼ばれること
 *  - ANALYTICS_PROVIDER=segment のとき ANALYTICS_WRITE_KEY なしでも throw しないこと
 *  - 不正なイベントプロパティを渡しても throw しないこと（計測失敗でコア処理を止めない）
 */
import assert from "node:assert/strict";
import { trackEvent, type AnalyticsEvent } from "../index";

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

  console.log("\nanalytics テスト\n");

  // ---- provider=console ----

  await test("ANALYTICS_PROVIDER=console: trackEvent が resolve する", async () => {
    process.env.ANALYTICS_PROVIDER = "console";
    const logs: unknown[] = [];
    const orig = console.log;
    console.log = (...args) => logs.push(args);
    try {
      await trackEvent({ name: "dashboard_viewed", userId: "test-user" });
    } finally {
      console.log = orig;
    }
    // console.log が呼ばれたことを確認（[analytics] 付きの行）
    const found = logs.some((l) =>
      Array.isArray(l) && String(l[0]).includes("[analytics]"),
    );
    assert.ok(found, "console.log に [analytics] ログが出力されていない");
  });

  await test("signup イベントを throw せず送信できる", async () => {
    process.env.ANALYTICS_PROVIDER = "console";
    const event: AnalyticsEvent = {
      name: "signup",
      userId: "test-user-id",
      method: "email_magic_link",
    };
    await assert.doesNotReject(trackEvent(event));
  });

  await test("activation イベントを throw せず送信できる", async () => {
    process.env.ANALYTICS_PROVIDER = "console";
    const event: AnalyticsEvent = {
      name: "activation",
      userId: "test-user-id",
      definition: "two_items_within_24h",
      time_to_value_seconds: 3600,
    };
    await assert.doesNotReject(trackEvent(event));
  });

  await test("purchase イベントを throw せず送信できる", async () => {
    process.env.ANALYTICS_PROVIDER = "console";
    const event: AnalyticsEvent = {
      name: "purchase",
      userId: "test-user-id",
      plan: "pro_monthly",
      amount: 980,
      currency: "JPY",
    };
    await assert.doesNotReject(trackEvent(event));
  });

  // ---- provider=segment, WRITE_KEY なし ----

  await test(
    "ANALYTICS_PROVIDER=segment, WRITE_KEY なし: warn 出力し throw しない",
    async () => {
      process.env.ANALYTICS_PROVIDER = "segment";
      delete process.env.ANALYTICS_WRITE_KEY;
      const warns: unknown[] = [];
      const orig = console.warn;
      console.warn = (...args) => warns.push(args);
      try {
        await assert.doesNotReject(
          trackEvent({ name: "dashboard_viewed", userId: "u1" }),
        );
      } finally {
        console.warn = orig;
      }
      const found = warns.some((w) =>
        Array.isArray(w) && String(w[0]).includes("ANALYTICS_WRITE_KEY"),
      );
      assert.ok(found, "WRITE_KEY 未設定時に warn が出力されていない");
    },
  );

  // ---- unknown provider ----

  await test("未知の ANALYTICS_PROVIDER: warn 出力し throw しない", async () => {
    process.env.ANALYTICS_PROVIDER = "unknown_provider";
    const warns: unknown[] = [];
    const orig = console.warn;
    console.warn = (...args) => warns.push(args);
    try {
      await assert.doesNotReject(
        trackEvent({ name: "dashboard_viewed", userId: "u2" }),
      );
    } finally {
      console.warn = orig;
      delete process.env.ANALYTICS_PROVIDER;
    }
    const found = warns.some((w) =>
      Array.isArray(w) && String(w[0]).includes("unknown"),
    );
    assert.ok(found, "未知プロバイダ時に warn が出力されていない");
  });

  // ---- NODE_ENV=test ----

  await test(
    "NODE_ENV=test: console.log を呼ばずに resolve する",
    async () => {
      const env = process.env as Record<string, string | undefined>;
      const origNodeEnv = env["NODE_ENV"];
      // TypeScript の型定義では NODE_ENV は readonly だが、
      // Node.js ランタイムでは process.env への直接代入が可能。
      // Record<string, string | undefined> にキャストして上書きする。
      env["NODE_ENV"] = "test";
      process.env.ANALYTICS_PROVIDER = "console";
      const logs: unknown[] = [];
      const orig = console.log;
      console.log = (...args) => logs.push(args);
      try {
        await trackEvent({ name: "dashboard_viewed", userId: "u3" });
        const found = logs.some(
          (l) => Array.isArray(l) && String(l[0]).includes("[analytics]"),
        );
        assert.ok(!found, "NODE_ENV=test なのに [analytics] ログが出力された");
      } finally {
        console.log = orig;
        env["NODE_ENV"] = origNodeEnv;
      }
    },
  );

  // ---- 結果集計 ----
  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runAll().catch((err) => {
  console.error("テスト実行エラー:", err);
  process.exit(1);
});
