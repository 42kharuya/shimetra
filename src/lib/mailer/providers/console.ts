// dev 用コンソールプロバイダ
// 実際には送信せず、ペイロードを stdout に出力する

import type { EmailPayload, SendEmailResult } from "../types";

export async function sendViaConsole(
  payload: EmailPayload
): Promise<SendEmailResult> {
  const messageId = `console-${Date.now()}`;
  console.log(
    "[mailer:console]",
    JSON.stringify({ messageId, ...payload }, null, 2)
  );
  return { ok: true, messageId };
}
