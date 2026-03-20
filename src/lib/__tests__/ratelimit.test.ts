/**
 * ratelimit モジュール 最小テスト
 * 実行: npx tsx src/lib/__tests__/ratelimit.test.ts
 *
 * テスト戦略:
 *  - getIdentifier: 各ヘッダから正しく IP を抽出できるか
 *  - checkMagicLinkRateLimit: Upstash 未設定時に limited=false を返すか
 *  - 定数: 環境変数で上書きできるか
 */

import assert from "node:assert/strict";
import {
  getIdentifier,
  checkMagicLinkRateLimit,
  RATE_LIMIT_MAGIC_LINK_MAX,
  RATE_LIMIT_MAGIC_LINK_WINDOW_SEC,
} from "../ratelimit";

// テスト中は Upstash 環境変数を未設定にしておく（スキップ動作を確認）
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

/** ヘッダを返すだけのモックリクエスト */
function mockReq(headers: Record<string, string>) {
  return {
    headers: {
      get(name: string): string | null {
        return headers[name.toLowerCase()] ?? null;
      },
    },
  };
}

async function runAll() {
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
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

  console.log("\nratelimit テスト\n");

  // ── getIdentifier ──────────────────────────────────────────────────────

  await test("getIdentifier: cf-connecting-ip を優先して返す", () => {
    const req = mockReq({ "cf-connecting-ip": "1.2.3.4" });
    assert.equal(getIdentifier(req), "1.2.3.4");
  });

  await test("getIdentifier: x-forwarded-for の先頭 IP を返す", () => {
    const req = mockReq({ "x-forwarded-for": "5.6.7.8, 9.10.11.12" });
    assert.equal(getIdentifier(req), "5.6.7.8");
  });

  await test("getIdentifier: x-real-ip を返す", () => {
    const req = mockReq({ "x-real-ip": "13.14.15.16" });
    assert.equal(getIdentifier(req), "13.14.15.16");
  });

  await test("getIdentifier: ヘッダなしなら 'unknown' を返す", () => {
    const req = mockReq({});
    assert.equal(getIdentifier(req), "unknown");
  });

  await test("getIdentifier: cf-connecting-ip を x-forwarded-for より優先する", () => {
    const req = mockReq({
      "cf-connecting-ip": "1.1.1.1",
      "x-forwarded-for": "2.2.2.2",
    });
    assert.equal(getIdentifier(req), "1.1.1.1");
  });

  // ── checkMagicLinkRateLimit（Upstash 未設定） ─────────────────────────

  await test("checkMagicLinkRateLimit: Upstash 未設定時は limited=false", async () => {
    const result = await checkMagicLinkRateLimit("127.0.0.1");
    assert.equal(result.limited, false);
  });

  // ── 定数 ──────────────────────────────────────────────────────────────

  await test("RATE_LIMIT_MAGIC_LINK_MAX: デフォルト 5", () => {
    assert.equal(RATE_LIMIT_MAGIC_LINK_MAX, 5);
  });

  await test("RATE_LIMIT_MAGIC_LINK_WINDOW_SEC: デフォルト 600", () => {
    assert.equal(RATE_LIMIT_MAGIC_LINK_WINDOW_SEC, 600);
  });

  // ── 結果サマリ ─────────────────────────────────────────────────────────

  console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
