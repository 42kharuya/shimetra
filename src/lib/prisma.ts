// Cloudflare Workers 対応: Neon サーバーレスドライバー（HTTP/WebSocket）を使用
// WASM 不使用のため Cloudflare Workers で動作する
// DATABASE_URL には Neon のプール接続 URL（postgresql://...?pgbouncer=true）を設定する
// DIRECT_URL はマイグレーション専用（直接 PostgreSQL 接続）
//
// see: https://neon.tech/docs/guides/prisma#use-connection-pooling
import { PrismaClient } from "@prisma/client/edge";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { env } from "@/lib/env";

// globalThis を使用（global は Edge Runtime で非推奨）
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const connectionString = env.DATABASE_URL;
  // Cloudflare Workers には WebSocket がグローバルに存在する
  neonConfig.webSocketConstructor = WebSocket;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

function getPrismaClient(): ReturnType<typeof createPrismaClient> {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy Proxy: モジュールインポート時に PrismaClient を初期化しない。
// 初回プロパティアクセス時（実リクエスト時）に初期化することで、
// Next.js ビルド時に DATABASE_URL が未設定でもクラッシュしない。
export const prisma = new Proxy({} as ReturnType<typeof createPrismaClient>, {
  get(_target, prop: string | symbol) {
    return (getPrismaClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
