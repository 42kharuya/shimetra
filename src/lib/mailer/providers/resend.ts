// prod 用 Resend プロバイダ
// 環境変数: RESEND_API_KEY, EMAIL_FROM

import { Resend } from "resend";
import type { EmailPayload, SendEmailResult } from "../types";

export async function sendViaResend(
  payload: EmailPayload
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY が設定されていません" };
  }
  const from = process.env.EMAIL_FROM;
  if (!from) {
    return { ok: false, error: "EMAIL_FROM が設定されていません" };
  }

  const client = new Resend(apiKey);

  const { data, error } = await client.emails.send({
    from,
    to: Array.isArray(payload.to) ? payload.to : [payload.to],
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  if (error) {
    return { ok: false, error: error.message ?? "Resend API エラー" };
  }

  return { ok: true, messageId: data?.id };
}
