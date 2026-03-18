/**
 * POST /api/auth/magic-link
 *
 * メールアドレスを受け取り、マジックリンクを送信する。
 * - 常に 200 を返す（メール存在有無を漏らさないため）
 * - バリデーション失敗時のみ 400 を返す
 */
export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { createMagicLinkToken } from "@/lib/auth/token";
import { sendEmail } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
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
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const magicLink = `${appUrl}/api/auth/verify?token=${token}`;
    const expiryMin = process.env.MAGIC_LINK_EXPIRY_MINUTES ?? "30";

    // dev 環境ではコピーしやすいよう URL を単独行で出力
    if (process.env.NODE_ENV !== "production") {
      console.log("\n[magic-link] ✉ LOGIN URL:\n" + magicLink + "\n");
    }

    const result = await sendEmail({
      to: email,
      subject: "【就活締切トラッカー】ログインリンク",
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
