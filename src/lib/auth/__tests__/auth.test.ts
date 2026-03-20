/**
 * auth ライブラリ 最小テスト
 *
 * テスト戦略:
 *  - session.ts: JWT の生成→検証が往復できるか（DB 不要）
 *  - token.ts: generateToken が 64 文字 hex を返すか（DB 不要）
 *  - consumeMagicLinkToken: prisma をモック差し替えして reason 区別を検証
 *
 * なぜ vi.mock を使うか:
 *  prisma.ts は neonConfig.webSocketConstructor = WebSocket を呼ぶが、
 *  Node 20（CI 環境）には WebSocket グローバルが存在しない。
 *  vi.mock でモジュールごと差し替えることで実クライアントを初期化させない。
 */

// vi.mock は Vitest のトランスフォーマーによりファイル先頭に巻き上げられる。
// そのため実際の @/lib/prisma モジュールは一切評価されない。
vi.mock("@/lib/prisma", () => ({
  prisma: {
    magicLinkToken: {
      findUnique: async () => null,
      update: async () => null,
    },
  },
}));

import assert from "node:assert/strict";
import { createSessionToken, verifySessionToken } from "../session";
import { generateToken, consumeMagicLinkToken } from "../token";
import { prisma } from "@/lib/prisma";

process.env.AUTH_SECRET = "test-secret-for-unit-test-only";

const payload = { sub: "00000000-0000-0000-0000-000000000001", email: "test@example.com" };

describe("auth", () => {
  it("createSessionToken: 文字列トークンを返す", async () => {
    const token = await createSessionToken(payload);
    assert.equal(typeof token, "string");
    assert.ok(token.length > 0);
  });

  it("verifySessionToken: 正しいトークンを検証できる", async () => {
    const token = await createSessionToken(payload);
    const result = await verifySessionToken(token);
    assert.ok(result !== null);
    assert.equal(result.sub, payload.sub);
    assert.equal(result.email, payload.email);
  });

  it("verifySessionToken: 改ざんトークンは null を返す", async () => {
    const result = await verifySessionToken("invalid.token.value");
    assert.equal(result, null);
  });

  it("verifySessionToken: 別の secret のトークンは null を返す", async () => {
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

  it("generateToken: 64 文字 hex を返す", async () => {
    const token = generateToken();
    assert.equal(typeof token, "string");
    assert.equal(token.length, 64);
    assert.ok(/^[0-9a-f]{64}$/.test(token), "hex 文字のみ");
  });

  it("generateToken: 呼ぶたびに異なる値を返す", async () => {
    assert.notEqual(generateToken(), generateToken());
  });

  // ── consumeMagicLinkToken: prisma モック差し替えで reason 区別を検証 ──
  // prisma.magicLinkToken の findUnique / update を差し替えて DB 不要でテスト

  it("consumeMagicLinkToken: 存在しないトークン → reason=invalid", async () => {
    (prisma.magicLinkToken as unknown as { findUnique: unknown }).findUnique =
      async () => null;
    const result = await consumeMagicLinkToken("nonexistent-token");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "invalid");
  });

  it("consumeMagicLinkToken: 期限切れトークン → reason=expired", async () => {
    const expiredRecord = {
      id: "id-1",
      email: "test@example.com",
      token: "some-token",
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000), // 1秒前 = 期限切れ
    };
    (prisma.magicLinkToken as unknown as { findUnique: unknown }).findUnique =
      async () => expiredRecord;
    const result = await consumeMagicLinkToken("some-token");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "expired");
  });

  it("consumeMagicLinkToken: 使用済みトークン → reason=invalid", async () => {
    const usedRecord = {
      id: "id-2",
      email: "test@example.com",
      token: "used-token",
      usedAt: new Date(Date.now() - 5000), // 使用済み
      expiresAt: new Date(Date.now() + 60_000),
    };
    (prisma.magicLinkToken as unknown as { findUnique: unknown }).findUnique =
      async () => usedRecord;
    const result = await consumeMagicLinkToken("used-token");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "invalid");
  });

  it("consumeMagicLinkToken: 有効なトークン → ok=true かつ email を返す", async () => {
    const validRecord = {
      id: "id-3",
      email: "valid@example.com",
      token: "valid-token",
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000), // 1分後 = 有効
    };
    (prisma.magicLinkToken as unknown as { findUnique: unknown }).findUnique =
      async () => validRecord;
    (prisma.magicLinkToken as unknown as { update: unknown }).update =
      async () => ({ ...validRecord, usedAt: new Date() });
    const result = await consumeMagicLinkToken("valid-token");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.email, "valid@example.com");
  });

});
