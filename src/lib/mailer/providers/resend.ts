// prod 用 Resend プロバイダ
// 環境変数: RESEND_API_KEY, EMAIL_FROM

import { Resend } from "resend";
import type { EmailPayload, SendEmailResult } from "../types";
import { env } from "@/lib/env";

export async function sendViaResend(
  payload: EmailPayload
): Promise<SendEmailResult> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY が設定されていません" };
  }
  const from = env.EMAIL_FROM;
  if (!from) {
    return { ok: false, error: "EMAIL_FROM が設定されていません" };
  }

  const client = new Resend(apiKey);

  // Resend v6 の型はユニオン（react 必須 or html/text オプション）のため、
  // undefined を含むプロパティを渡すと型エラーになる。
  // 定義済みのプロパティだけスプレッドで組み立ててキャストする。
  const sendData = {
    from,
    to: Array.isArray(payload.to) ? payload.to : [payload.to],
    subject: payload.subject,
    ...(payload.html !== undefined ? { html: payload.html } : {}),
    ...(payload.text !== undefined ? { text: payload.text } : {}),
  };

  const { data, error } = await client.emails.send(
    sendData as Parameters<typeof client.emails.send>[0],
  );

  if (error) {
    return { ok: false, error: error.message ?? "Resend API エラー" };
  }

  return { ok: true, messageId: data?.id };
}
