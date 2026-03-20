/**
 * sendEmail ユーティリティ 最小テスト
 *
 * テスト戦略:
 *  - consoleプロバイダは外部依存なしで検証可能 → ここで自動テスト
 *  - resendプロバイダは本番キーが必要 → 手動確認手順を PR に記載
 */

import assert from "node:assert/strict";
import { sendEmail } from "../index";

const payload = {
  to: "test@example.com",
  subject: "テスト件名",
  html: "<p>テスト本文</p>",
  text: "テスト本文",
};

describe("sendEmail", () => {
  // consoleプロバイダで正常送信
  it("console: ok:true を返す", async () => {
    process.env.EMAIL_PROVIDER = "console";
    const result = await sendEmail(payload);
    assert.equal(result.ok, true);
  });

  // consoleプロバイダ: messageId 付き
  it("console: messageId が返る", async () => {
    process.env.EMAIL_PROVIDER = "console";
    const result = await sendEmail(payload);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.ok(result.messageId, "messageId が存在する");
    }
  });

  // 未知プロバイダ
  // env.EMAIL_PROVIDER getter は未知値を "console" にフォールバックするため、
  // sendEmail 内の default ブランチは到達不可。実質的には console プロバイダとして扱われる。
  it("未知provider: env ゲッターのフォールバックにより console として扱われ ok:true を返す", async () => {
    process.env.EMAIL_PROVIDER = "unknown_provider";
    const result = await sendEmail(payload);
    // env.EMAIL_PROVIDER getter は未知値を "console" にコエースするため ok:true
    assert.equal(result.ok, true);
  });

  // resendプロバイダ: RESEND_API_KEY 未設定
  it("resend: RESEND_API_KEY 未設定で ok:false を返す", async () => {
    process.env.EMAIL_PROVIDER = "resend";
    const prev = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    const result = await sendEmail(payload);
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.error.includes("RESEND_API_KEY"));
    process.env.RESEND_API_KEY = prev;
  });

});
