import type { OpenNextConfig } from "@opennextjs/cloudflare";

// @opennextjs/cloudflare の設定ファイル
// ビルド時: npx opennextjs-cloudflare build
// ローカル開発: npx wrangler dev
// デプロイ: npx wrangler deploy
// see: https://opennext.js.org/cloudflare/get-started
const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      // Cron ハンドラー: wrangler.toml の [triggers] cron から呼ばれる
      // → /api/cron/notify Route Handler に転送される
    },
  },
};

export default config;
