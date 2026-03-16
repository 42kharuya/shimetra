import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Next.js の HMR でも接続を使い回すためのシングルトンパターン
// see: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

// Prisma v7 では datasource url を schema.prisma に書けないため、
// @prisma/adapter-pg でランタイム時に接続文字列を渡す
const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? "";
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
