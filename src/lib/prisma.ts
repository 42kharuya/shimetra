import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Cloudflare Edge Runtime 対応: Prisma Accelerate（HTTP経由）を使用
// DATABASE_URL には prisma://accelerate.prisma.data.net/?api_key=... を設定する
// ローカル開発も Accelerate 経由が可能（Prisma Console で設定）
// マイグレーション実行には DIRECT_URL（直接 PostgreSQL 接続）が必要
//
// see: https://www.prisma.io/docs/accelerate

// globalThis を使用（global は Edge Runtime で非推奨）
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

function createPrismaClient() {
  // withAccelerate() は DATABASE_URL（prisma://...）を自動読み取る
  // なお Prisma v7 では datasources オプションは廃止されたため不使用
  return new PrismaClient().$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
