// メール送信基盤の型定義

export interface EmailPayload {
  /** 送信先アドレス（複数可） */
  to: string | string[];
  /** メール件名 */
  subject: string;
  /** HTML本文（省略時は text のみ） */
  html?: string;
  /** テキスト本文（省略時は html から自動生成されない点に注意） */
  text?: string;
}

export type SendEmailResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string };
