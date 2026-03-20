/**
 * analytics 最小テスト
 *
 * テスト戦略:
 *  - trackEvent が Promise<void> を返し throw しないこと
 *  - ANALYTICS_PROVIDER=console のとき console.log が呼ばれること
 *  - ANALYTICS_PROVIDER=segment のとき ANALYTICS_WRITE_KEY なしでも throw しないこと
 *  - 不正なイベントプロパティを渡しても throw しないこと（計測失敗でコア処理を止めない）
 */
import assert from "node:assert/strict";
import { trackEvent, type AnalyticsEvent } from "../index";

describe("analytics", () => {
  // ---- provider=console ----

  it("ANALYTICS_PROVIDER=console: trackEvent が resolve する", async () => {
    const env = process.env as Record<string, string | undefined>;
    const origNodeEnv = env["NODE_ENV"];
    env["NODE_ENV"] = "development"; // NODE_ENV=test だと analytics が沈黙モードになるため
    process.env.ANALYTICS_PROVIDER = "console";
    const logs: unknown[] = [];
    const orig = console.log;
    console.log = (...args) => logs.push(args);
    try {
      await trackEvent({ name: "dashboard_viewed", userId: "test-user" });
    } finally {
      console.log = orig;
      env["NODE_ENV"] = origNodeEnv;
    }
    // console.log が呼ばれたことを確認（[analytics] 付きの行）
    const found = logs.some((l) =>
      Array.isArray(l) && String(l[0]).includes("[analytics]"),
    );
    assert.ok(found, "console.log に [analytics] ログが出力されていない");
  });

  it("signup イベントを throw せず送信できる", async () => {
    process.env.ANALYTICS_PROVIDER = "console";
    const event: AnalyticsEvent = {
      name: "signup",
      userId: "test-user-id",
      method: "email_magic_link",
    };
    await assert.doesNotReject(trackEvent(event));
  });

  it("activation イベントを throw せず送信できる", async () => {
    process.env.ANALYTICS_PROVIDER = "console";
    const event: AnalyticsEvent = {
      name: "activation",
      userId: "test-user-id",
      definition: "two_items_within_24h",
      time_to_value_seconds: 3600,
    };
    await assert.doesNotReject(trackEvent(event));
  });

  it("purchase イベントを throw せず送信できる", async () => {
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

  it(
    "ANALYTICS_PROVIDER=segment, WRITE_KEY なし: warn 出力し throw しない",
    async () => {
      const env = process.env as Record<string, string | undefined>;
      const origNodeEnv = env["NODE_ENV"];
      env["NODE_ENV"] = "development"; // NODE_ENV=test だと analytics が沈黙モードになるため
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
        env["NODE_ENV"] = origNodeEnv;
      }
      const found = warns.some((w) =>
        Array.isArray(w) && String(w[0]).includes("ANALYTICS_WRITE_KEY"),
      );
      assert.ok(found, "WRITE_KEY 未設定時に warn が出力されていない");
    },
  );

  // ---- unknown provider ----

  // env.ANALYTICS_PROVIDER getter は未知値を "console" にコエースするため、
  // unknown provider の warn パスは到達不可。
  // 実随には console プロバイダとして動作する（フォールバック動作の確認）。
  it("未知の ANALYTICS_PROVIDER: env getter のフォールバックにより throw しない", async () => {
    const env = process.env as Record<string, string | undefined>;
    const origNodeEnv = env["NODE_ENV"];
    env["NODE_ENV"] = "development";
    process.env.ANALYTICS_PROVIDER = "unknown_provider";
    try {
      await assert.doesNotReject(
        trackEvent({ name: "dashboard_viewed", userId: "u2" }),
      );
    } finally {
      env["NODE_ENV"] = origNodeEnv;
      delete process.env.ANALYTICS_PROVIDER;
    }
  });

  // ---- NODE_ENV=test ----

  it(
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
});
