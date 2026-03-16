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
 *
 * 【注意】findUnique → チェック → update のパターンは TOCTOU（競合）が起きる。
 * update の where 条件で "usedAt が null かつ期限内" を DB 側で一発確認し、
 * 1 つのクエリで atomic に「確認 + 使用済みマーク」を行う。
 */
export async function consumeMagicLinkToken(
  token: string,
): Promise<string | null> {
  try {
    const record = await prisma.magicLinkToken.update({
      where: {
        token,
        usedAt: null,            // 未使用であること
        expiresAt: { gte: new Date() }, // 期限内であること
      },
      data: { usedAt: new Date() },
    });
    return record.email;
  } catch {
    // 該当レコードなし（存在しない / 使用済み / 期限切れ）
    return null;
  }
}
