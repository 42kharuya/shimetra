// eslint-config-next@15 はレガシー形式（CommonJS + @rushstack/eslint-patch）のため、
// ESLint 9 flat config から使う場合は @eslint/eslintrc の FlatCompat でラップする。
// Next.js 16 以降になったら nextConfig を直接 spread するシンプルな形式に戻せる。
// see: https://nextjs.org/docs/app/api-reference/config/eslint
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  // ビルド成果物・依存パッケージは lint 対象外
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "prisma/migrations/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default config;
