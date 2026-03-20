/**
 * マジックリンクトークン管理
 *
 * - トークンは crypto.randomBytes で生成する 64 文字 hex 文字列
 * - 有効期限: MAGIC_LINK_EXPIRY_MINUTES（デフォルト 30 分）
 * - 使い捨て: 一度使われたトークンは再利用不可
 * - 同一メールの期限切れトークンは作成時にクリーンアップ
 */
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

/** consumeMagicLinkToken の戻り値 */
export type ConsumeTokenResult =
  | { ok: true; email: string }
  | { ok: false; reason: "expired" | "invalid" };

// MAGIC_LINK_EXPIRY_MINUTES は env 経由で取得（デフォルト: 30）
function getExpiryMinutes(): number {
  return env.MAGIC_LINK_EXPIRY_MINUTES;
}

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
  const expiresAt = new Date(Date.now() + getExpiryMinutes() * 60 * 1000);

  await prisma.magicLinkToken.create({
    data: { email, token, expiresAt },
  });

  return token;
}

/**
 * トークンを検証して対応するメールアドレスを返す。
 *
 * - 成功: { ok: true, email }
 * - 期限切れ: { ok: false, reason: "expired" }
 * - 存在しない / 使用済み: { ok: false, reason: "invalid" }
 *
 * 【設計メモ】
 * @prisma/adapter-pg は updateMany / update の複合 WHERE 条件（非ユニーク列）を
 * 正しく処理できないケースがある。
 * そのため「findUnique で取得 → アプリ側で検証 → id(@unique) で update」に統一する。
 * MVP スコープでは同一リンクへの並行クリックは発生しないため、この方式で十分。
 */
export async function consumeMagicLinkToken(
  token: string,
): Promise<ConsumeTokenResult> {
  const record = await prisma.magicLinkToken.findUnique({ where: { token } });
  if (!record) return { ok: false, reason: "invalid" };
  if (record.usedAt !== null) return { ok: false, reason: "invalid" };
  if (record.expiresAt < new Date()) return { ok: false, reason: "expired" };

  // id (@unique) のみで update → adapter-pg でも確実に動作する
  await prisma.magicLinkToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { ok: true, email: record.email };
}
