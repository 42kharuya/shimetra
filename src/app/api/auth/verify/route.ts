/**
 * GET /api/auth/verify?token=...
 *
 * マジックリンクのトークンを検証し、セッション Cookie を発行する。
 *
 * Signup確定タイミング（ADR 0001 準拠）:
 *   ここでユーザーが存在しない場合に upsert する =
 *   「メール確認（マジックリンクのクリック）完了 = ユーザー作成確定」
 */
import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLinkToken } from "@/lib/auth/token";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // コピー時の末尾 \ 等の非hex文字を除去するサニタイズ
  const rawToken = req.nextUrl.searchParams.get("token") ?? "";
  const token = rawToken.replace(/[^0-9a-f]/gi, "");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  let email: string | null = null;
  try {
    console.log("[verify] token received:", token.slice(0, 8) + "...");
    email = await consumeMagicLinkToken(token);
    console.log("[verify] consumeMagicLinkToken result:", email);
  } catch (err) {
    console.error("[verify] consumeMagicLinkToken error:", err);
    return NextResponse.redirect(new URL("/login?error=server", req.url));
  }

  if (!email) {
    // トークン無効（存在しない / 期限切れ / 使用済み）
    console.log("[verify] email is null → redirect expired");
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  try {
    // Signup確定: メール確認完了をもってユーザーを作成する（既存なら取得のみ）
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

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
