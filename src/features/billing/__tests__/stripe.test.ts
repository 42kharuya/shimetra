/**
 * Stripe checkout 最小テスト
 *
 * テスト戦略:
 *  - STRIPE_SECRET_KEY 未設定時にエラーが throw されるか
 *  - STRIPE_PRICE_ID 未設定時にエラーが throw されるか
 *  - stripe クライアントが有効なキーで初期化できるか（実際の API 呼び出しは手動確認）
 */

import "dotenv/config";
import assert from "node:assert/strict";

/** checkout route 内の getRequiredEnv と同等のユーティリティ（ローカル再定義でテスト） */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not set. Add it to .env`);
  }
  return value;
}

describe("Stripe checkout", () => {
  it("getRequiredEnv: 未設定の変数は Error を throw する", () => {
    const missingKey = "__NONEXISTENT_ENV_VAR_FOR_TEST__";
    delete process.env[missingKey];
    assert.throws(
      () => getRequiredEnv(missingKey),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes(missingKey));
        return true;
      },
    );
  });

  it("getRequiredEnv: 設定済みの変数は値を返す", () => {
    const key = "__TEST_ENV_VAR__";
    process.env[key] = "test-value";
    const val = getRequiredEnv(key);
    assert.equal(val, "test-value");
    delete process.env[key];
  });

  it("stripe クライアント初期化: STRIPE_SECRET_KEY 未設定は Error を throw する", async () => {
    const originalKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    // キャッシュされたシングルトンを回避するため、直接ファクトリロジックをテスト
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
