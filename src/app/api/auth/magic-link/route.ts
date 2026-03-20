/**
 * POST /api/auth/magic-link
 *
 * メールアドレスを受け取り、マジックリンクを送信する。
 * - 常に 200 を返す（メール存在有無を漏らさないため）
 * - バリデーション失敗時のみ 400 を返す
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createMagicLinkToken } from "@/lib/auth/token";
import { sendEmail } from "@/lib/mailer";
import { env } from "@/lib/env";
import {
  checkMagicLinkRateLimit,
  getIdentifier,
  RATE_LIMIT_MAGIC_LINK_MAX,
  RATE_LIMIT_MAGIC_LINK_WINDOW_SEC,
} from "@/lib/ratelimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // ── レート制限チェック ──────────────────────────────────────────────
    const identifier = getIdentifier(req);
    const rateResult = await checkMagicLinkRateLimit(identifier);
    if (rateResult.limited) {
      const retryAfterSec = Math.ceil((rateResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `リクエストが多すぎます。${Math.ceil(RATE_LIMIT_MAGIC_LINK_WINDOW_SEC / 60)}分後に再試行してください`,
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(retryAfterSec, 1)),
            "X-RateLimit-Limit": String(RATE_LIMIT_MAGIC_LINK_MAX),
            "X-RateLimit-Reset": String(rateResult.reset),
          },
        },
      );
    }

    const body = await req.json().catch(() => ({}));
    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 },
      );
    }

    const token = await createMagicLinkToken(email);
    const appUrl = env.APP_URL;
    const magicLink = `${appUrl}/api/auth/verify?token=${token}`;
    const expiryMin = env.MAGIC_LINK_EXPIRY_MINUTES;

    // dev 環境ではコピーしやすいよう URL を単独行で出力
    if (env.NODE_ENV !== "production") {
      console.log("\n[magic-link] ✉ LOGIN URL:\n" + magicLink + "\n");
    }

    const result = await sendEmail({
      to: email,
      subject: "【〆トラ】ログインリンク",
      html: `
        <p>以下のリンクをクリックしてログインしてください。</p>
        <p style="margin:16px 0">
          <a href="${magicLink}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
            ログインする
          </a>
        </p>
        <p style="font-size:12px;color:#666">
          このリンクは${expiryMin}分間有効です。<br>
          心当たりがない場合はこのメールを無視してください。
        </p>
      `.trim(),
    });

    if (!result.ok) {
      console.error("[magic-link] sendEmail failed:", result.error);
      return NextResponse.json(
        { error: "メール送信に失敗しました。しばらく後に試してください" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[magic-link] unexpected error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
