// メール送信ユーティリティ
//
// 環境変数:
//   EMAIL_PROVIDER  "console" | "resend"  (デフォルト: "console")
//   RESEND_API_KEY  Resend API キー        (EMAIL_PROVIDER=resend 時に必須)
//   EMAIL_FROM      送信元アドレス          (EMAIL_PROVIDER=resend 時に必須)
//
// 使い方:
//   import { sendEmail } from "@/lib/mailer";
//   const result = await sendEmail({ to, subject, html });
//   if (!result.ok) { /* エラーハンドリング */ }

import { sendViaConsole } from "./providers/console";
import { sendViaResend } from "./providers/resend";
import type { EmailPayload, SendEmailResult } from "./types";

export type { EmailPayload, SendEmailResult };

/**
 * メールを送信する。
 * プロバイダは EMAIL_PROVIDER 環境変数で切り替える。
 * 送信失敗は例外を投げず { ok: false, error } で返す。
 */
export async function sendEmail(
  payload: EmailPayload
): Promise<SendEmailResult> {
  const provider = process.env.EMAIL_PROVIDER ?? "console";

  try {
    switch (provider) {
      case "resend":
        return await sendViaResend(payload);
      case "console":
        return await sendViaConsole(payload);
      default:
        return {
          ok: false,
          error: `未知の EMAIL_PROVIDER: "${provider}"`,
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mailer] 送信エラー:", { provider, error: message, to: payload.to, subject: payload.subject });
    return { ok: false, error: message };
  }
}
