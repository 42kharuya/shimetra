/**
 * ratelimit モジュール 最小テスト
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

describe("ratelimit", () => {
  // ── getIdentifier ──────────────────────────────────────────────────────

  it("getIdentifier: cf-connecting-ip を優先して返す", () => {
    const req = mockReq({ "cf-connecting-ip": "1.2.3.4" });
    assert.equal(getIdentifier(req), "1.2.3.4");
  });

  it("getIdentifier: x-forwarded-for の先頭 IP を返す", () => {
    const req = mockReq({ "x-forwarded-for": "5.6.7.8, 9.10.11.12" });
    assert.equal(getIdentifier(req), "5.6.7.8");
  });

  it("getIdentifier: x-real-ip を返す", () => {
    const req = mockReq({ "x-real-ip": "13.14.15.16" });
    assert.equal(getIdentifier(req), "13.14.15.16");
  });

  it("getIdentifier: ヘッダなしなら 'unknown' を返す", () => {
    const req = mockReq({});
    assert.equal(getIdentifier(req), "unknown");
  });

  it("getIdentifier: cf-connecting-ip を x-forwarded-for より優先する", () => {
    const req = mockReq({
      "cf-connecting-ip": "1.1.1.1",
      "x-forwarded-for": "2.2.2.2",
    });
    assert.equal(getIdentifier(req), "1.1.1.1");
  });

  // ── checkMagicLinkRateLimit（Upstash 未設定） ─────────────────────────

  it("checkMagicLinkRateLimit: Upstash 未設定時は limited=false", async () => {
    const result = await checkMagicLinkRateLimit("127.0.0.1");
    assert.equal(result.limited, false);
  });

  // ── 定数 ──────────────────────────────────────────────────────────────

  it("RATE_LIMIT_MAGIC_LINK_MAX: デフォルト 5", () => {
    assert.equal(RATE_LIMIT_MAGIC_LINK_MAX, 5);
  });

  it("RATE_LIMIT_MAGIC_LINK_WINDOW_SEC: デフォルト 600", () => {
    assert.equal(RATE_LIMIT_MAGIC_LINK_WINDOW_SEC, 600);
  });

});
