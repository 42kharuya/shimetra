/**
 * JWT セッション管理
 *
 * - セッションは httpOnly Cookie に署名済み JWT として保持する
 * - 署名キー: AUTH_SECRET 環境変数（必須）
 * - 有効期限: 30日
 * - Edge Runtime 対応（jose を使用、Node.js crypto 不使用）
 */
import { SignJWT, jwtVerify } from "jose";
import { type NextRequest } from "next/server";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "__session";
const SESSION_DURATION_DAYS = 30;

export interface SessionPayload {
  sub: string; // user id (UUID)
  email: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Add it to .env");
  }
  return new TextEncoder().encode(secret);
}

/** JWT セッショントークンを作成する */
export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getSecret());
}

/** JWT セッショントークンを検証して payload を返す。無効なら null */
export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

/**
 * セッションを取得する。
 * - Middleware（Edge）: req を渡す
 * - Server Component / Route Handler: req なしで呼ぶ
 */
export async function getSession(
  req?: NextRequest,
): Promise<SessionPayload | null> {
  let token: string | undefined;
  if (req) {
    token = req.cookies.get(SESSION_COOKIE)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE)?.value;
  }
  if (!token) return null;
  return verifySessionToken(token);
}

/** Set-Cookie ヘッダー用オプションを返す */
export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DURATION_DAYS,
  };
}
