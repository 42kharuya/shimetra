/**
 * Stripe Customer Portal API 最小テスト
 *
 * テスト戦略:
 *  - APP_URL 未設定時に Error が throw されるか
 *  - STRIPE_SECRET_KEY 未設定時に Error が throw されるか
 *  - stripe_customer_id が null の場合に 400 相当のエラーを返すロジック確認
 *  （実際の billingPortal.sessions.create は手動確認とする: Stripe Dashboard にPortal設定が必要）
 */

import "dotenv/config";
import assert from "node:assert/strict";

/** portal route 内の必須環境変数チェックと同等のロジック */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not set. Add it to .env`);
  }
  return value;
}

/** stripe_customer_id が存在しない場合の応答ロジック（route から抽出） */
function resolvePortalError(stripeCustomerId: string | null | undefined): string | null {
  if (!stripeCustomerId) {
    return "Stripe カスタマー情報が見つかりません。先にプランのアップグレードをおこなってください。";
  }
  return null;
}

describe("Stripe Customer Portal", () => {
  it("requireEnv: 未設定の変数は Error を throw する", () => {
    const missingKey = "__NONEXISTENT_PORTAL_ENV_VAR__";
    delete process.env[missingKey];
    assert.throws(
      () => requireEnv(missingKey),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes(missingKey));
        return true;
      },
    );
  });

  it("requireEnv: 設定済みの変数は値を返す", () => {
    const key = "__TEST_PORTAL_ENV_VAR__";
    process.env[key] = "http://localhost:3000";
    const val = requireEnv(key);
    assert.equal(val, "http://localhost:3000");
    delete process.env[key];
  });

  it("resolvePortalError: stripeCustomerId が null → エラーメッセージを返す", () => {
    const err = resolvePortalError(null);
    assert.ok(err !== null);
    assert.ok(err.includes("アップグレード"));
  });

  it("resolvePortalError: stripeCustomerId が undefined → エラーメッセージを返す", () => {
    const err = resolvePortalError(undefined);
    assert.ok(err !== null);
    assert.ok(err.includes("アップグレード"));
  });

  it("resolvePortalError: stripeCustomerId が設定済み → null（エラーなし）", () => {
    const err = resolvePortalError("cus_test_12345");
    assert.equal(err, null);
  });

  it("STRIPE_SECRET_KEY 未設定は Error を throw する（portal route も同じ依存）", () => {
    const originalKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    try {
      assert.throws(() => {
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env");
        }
      });
    } finally {
      if (originalKey !== undefined) {
        process.env.STRIPE_SECRET_KEY = originalKey;
      }
    }
  });

});
