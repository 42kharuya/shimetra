// Cloudflare Workers では WebAssembly が禁止されているため /edge サブパスを使用
// /edge は Prisma Accelerate（HTTP経由）専用の軽量クライアント（WASM不使用）
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

// Cloudflare Edge Runtime 対応: Prisma Accelerate（HTTP経由）を使用
// DATABASE_URL には prisma://accelerate.prisma.data.net/?api_key=... を設定する
// ローカル開発も Accelerate 経由が可能（Prisma Console で設定）
// マイグレーション実行には DIRECT_URL（直接 PostgreSQL 接続）が必要
//
// see: https://www.prisma.io/docs/accelerate

// globalThis を使用（global は Edge Runtime で非推奨）
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  // /edge クライアントは HTTP 専用（WASM不使用）で process.env.DATABASE_URL を直接読む
  // withAccelerate() が prisma:// URL を処理して Accelerate 経由で接続する
  // accelerateUrl オプションは withAccelerate() と競合するため使用しない
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return new PrismaClient().$extends(withAccelerate());
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
