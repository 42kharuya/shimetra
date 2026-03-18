import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI（prisma migrate / prisma db push / prisma studio）用
    // Cloudflare Workers Edge Runtime では使用しない（TCP 接続不可）
    // 本番: Neon（postgresql://...）、ローカル: docker-compose の Postgres URL
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
