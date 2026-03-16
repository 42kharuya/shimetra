/**
 * Next.js Middleware — 認証ガード
 *
 * 保護パス: /dashboard /deadline /billing
 *   → 未ログイン時は /login?redirect=<元パス> へリダイレクト
 *
 * 認証済みで /login へのアクセス
 *   → /dashboard へリダイレクト（再ログイン防止）
 *
 * セッション検証は JWT の署名検証のみ（DB アクセスなし）。
 * Edge Runtime 対応（jose を使用）。
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

const PROTECTED_PREFIXES = ["/dashboard", "/deadline", "/billing"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isLoginPage = pathname === "/login";

  const session = await getSession(req);

  // 未ログインで保護ページへのアクセス → /login へリダイレクト
  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ログイン済みで /login へのアクセス → /dashboard へリダイレクト
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/deadline/:path*",
    "/billing/:path*",
    "/login",
  ],
};
