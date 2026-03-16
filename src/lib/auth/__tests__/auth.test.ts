/**
 * auth ライブラリ 最小テスト
 * 実行: npx tsx src/lib/auth/__tests__/auth.test.ts
 *
 * テスト戦略:
 *  - session.ts: JWT の生成→検証が往復できるか（DB 不要）
 *  - token.ts: generateToken が 64 文字 hex を返すか（DB 不要）
 *  - consumeMagicLinkToken: DB 依存のため手動確認手順を PR に記載
 */

// Prisma クライアント初期化前に DATABASE_URL を読み込む
import "dotenv/config";

import assert from "node:assert/strict";
import { createSessionToken, verifySessionToken } from "../session";
import { generateToken } from "../token";

process.env.AUTH_SECRET = "test-secret-for-unit-test-only";

const payload = { sub: "00000000-0000-0000-0000-000000000001", email: "test@example.com" };

async function runAll() {
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
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

  console.log("\nauth テスト\n");

  await test("createSessionToken: 文字列トークンを返す", async () => {
    const token = await createSessionToken(payload);
    assert.equal(typeof token, "string");
    assert.ok(token.length > 0);
  });

  await test("verifySessionToken: 正しいトークンを検証できる", async () => {
    const token = await createSessionToken(payload);
    const result = await verifySessionToken(token);
    assert.ok(result !== null);
    assert.equal(result.sub, payload.sub);
    assert.equal(result.email, payload.email);
  });

  await test("verifySessionToken: 改ざんトークンは null を返す", async () => {
    const result = await verifySessionToken("invalid.token.value");
    assert.equal(result, null);
  });

  await test("verifySessionToken: 別の secret のトークンは null を返す", async () => {
    const other = "other-secret";
    const { SignJWT } = await import("jose");
    const token = await new SignJWT({ email: "x@x.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("uuid-xxx")
      .setExpirationTime("1d")
      .sign(new TextEncoder().encode(other));
    const result = await verifySessionToken(token);
    assert.equal(result, null);
  });

  await test("generateToken: 64 文字 hex を返す", async () => {
    const token = generateToken();
    assert.equal(typeof token, "string");
    assert.equal(token.length, 64);
    assert.ok(/^[0-9a-f]{64}$/.test(token), "hex 文字のみ");
  });

  await test("generateToken: 呼ぶたびに異なる値を返す", async () => {
    assert.notEqual(generateToken(), generateToken());
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
