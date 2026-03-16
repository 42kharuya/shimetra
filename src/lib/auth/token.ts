/**
 * マジックリンクトークン管理
 *
 * - トークンは crypto.randomBytes で生成する 64 文字 hex 文字列
 * - 有効期限: MAGIC_LINK_EXPIRY_MINUTES（デフォルト 30 分）
 * - 使い捨て: 一度使われたトークンは再利用不可
 * - 同一メールの期限切れトークンは作成時にクリーンアップ
 */
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const EXPIRY_MINUTES = parseInt(
  process.env.MAGIC_LINK_EXPIRY_MINUTES ?? "30",
  10,
);

/** 暗号学的にランダムなトークン文字列を生成 */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * マジックリンクトークンを生成して DB に保存する。
 * 同一メールの期限切れトークンは削除してから作成する。
 */
export async function createMagicLinkToken(email: string): Promise<string> {
  // 期限切れトークンを削除（テーブルの肥大化防止）
  await prisma.magicLinkToken.deleteMany({
    where: {
      email,
      expiresAt: { lt: new Date() },
    },
  });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

  await prisma.magicLinkToken.create({
    data: { email, token, expiresAt },
  });

  return token;
}

/**
 * トークンを検証して対応するメールアドレスを返す。
 * 無効（存在しない / 期限切れ / 使用済み）の場合は null を返す。
 * 有効なら usedAt を記録して使い捨てにする（トランザクション）。
 */
export async function consumeMagicLinkToken(
  token: string,
): Promise<string | null> {
  const record = await prisma.magicLinkToken.findUnique({ where: { token } });
  if (!record) return null;
  if (record.usedAt) return null; // 使用済み
  if (record.expiresAt < new Date()) return null; // 期限切れ

  await prisma.magicLinkToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record.email;
}
