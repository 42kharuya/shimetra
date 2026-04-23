// Cloudflare Workers 対応: Neon サーバーレスドライバー（HTTP/WebSocket）を使用
// WASM 不使用のため Cloudflare Workers で動作する
// DATABASE_URL には Neon のプール接続 URL（postgresql://...?pgbouncer=true）を設定する
// DIRECT_URL はマイグレーション専用（直接 PostgreSQL 接続）
//
// ⚠️ Cloudflare Workers では I/O オブジェクト（WebSocket接続など）を
// リクエストをまたいで使い回すことが禁止されている。
// そのため、シングルトンパターンは使用せず、リクエストごとに
// 新しい PrismaClient インスタンスを生成する。
//
// see: https://neon.tech/docs/guides/prisma#use-connection-pooling
import { PrismaClient } from "@prisma/client/edge";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { env } from "@/lib/env";

function createPrismaClient() {
  const connectionString = env.DATABASE_URL;
  // Cloudflare Workers には WebSocket がグローバルに存在する
  neonConfig.webSocketConstructor = WebSocket;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

// Lazy Proxy: モジュールインポート時に PrismaClient を初期化しない。
// プロパティアクセスのたびに新しいインスタンスを生成することで
// Cloudflare Workers のリクエスト間 I/O 共有禁止制約に対応する。
export const prisma = new Proxy({} as ReturnType<typeof createPrismaClient>, {
  get(_target, prop: string | symbol) {
    const client = createPrismaClient();
    return (client as unknown as Record<string | symbol, unknown>)[prop];
  },
});
