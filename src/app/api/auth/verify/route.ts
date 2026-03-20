/**
 * GET /api/auth/verify?token=...
 *
 * マジックリンクのトークンを検証し、セッション Cookie を発行する。
 *
 * Signup確定タイミング（ADR 0001 準拠）:
 *   ここでユーザーが存在しない場合に upsert する =
 *   「メール確認（マジックリンクのクリック）完了 = ユーザー作成確定」
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLinkToken } from "@/lib/auth/token";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  // コピー時の末尾 \ 等の非hex文字を除去するサニタイズ
  const rawToken = req.nextUrl.searchParams.get("token") ?? "";
  const token = rawToken.replace(/[^0-9a-f]/gi, "");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  let tokenResult: Awaited<ReturnType<typeof consumeMagicLinkToken>>;
  try {
    tokenResult = await consumeMagicLinkToken(token);
  } catch (err) {
    console.error("[verify] consumeMagicLinkToken error:", err);
    return NextResponse.redirect(new URL("/login?error=server", req.url));
  }

  if (!tokenResult.ok) {
    // expired: リンクが期限切れ → 再送を促す
    // invalid: 存在しない / 使用済み → 無効なリンク
    const errorParam = tokenResult.reason === "expired" ? "expired" : "invalid";
    return NextResponse.redirect(new URL(`/login?error=${errorParam}`, req.url));
  }

  const email = tokenResult.email;

  try {
    // Signup確定: メール確認完了をもってユーザーを作成する（既存なら取得のみ）
    // 新規作成か既存かを判定するため、upsert 前に存在確認する
    const existingUser = await prisma.user.findUnique({ where: { email } });

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    // 新規ユーザーのみ signup イベントを送信（既存ユーザーの再ログインは除く）
    if (!existingUser) {
      await trackEvent({
        name: "signup",
        userId: user.id,
        method: "email_magic_link",
      });
    }

    const sessionToken = await createSessionToken({
      sub: user.id,
      email: user.email,
    });

    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    response.cookies.set(sessionCookieOptions(sessionToken));
    return response;
  } catch (err) {
    console.error("[verify] user upsert / session error:", err);
    return NextResponse.redirect(new URL("/login?error=server", req.url));
  }
}
