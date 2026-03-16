import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DATABASE_URL が未設定でも prisma generate は通るように process.env 経由で参照
    url: process.env.DATABASE_URL ?? "",
  },
});
