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
 * 【設計】
 * prisma.update の where は @unique フィールドのみ確実にフィルタされる。
 * 非ユニーク列（usedAt / expiresAt）の追加条件は adapter-pg では動作が
 * 不安定なため、updateMany（任意 where を完全サポート）を使う。
 * - updateMany で "未使用かつ期限内" を条件に atomic にマーク
 * - count === 0 なら無効（存在しない / 使用済み / 期限切れ）
 * - count > 0 なら有効 → 別途 email を取得して返す
 */
export async function consumeMagicLinkToken(
  token: string,
): Promise<string | null> {
  const now = new Date();

  // Step 1: email を先に取得（存在確認）
  const record = await prisma.magicLinkToken.findUnique({ where: { token } });
  if (!record) return null;

  // Step 2: "未使用かつ期限内" の場合のみ atomic に usedAt をセット
  const { count } = await prisma.magicLinkToken.updateMany({
    where: {
      token,
      usedAt: null,               // 未使用であること
      expiresAt: { gte: now },    // 期限内であること
    },
    data: { usedAt: now },
  });

  // count === 0 は「使用済み or 期限切れ」
  if (count === 0) return null;

  return record.email;
}
