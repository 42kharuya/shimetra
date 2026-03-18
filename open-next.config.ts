import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// @opennextjs/cloudflare v1 の設定ファイル
// ビルド時: npm run build:cloudflare (opennextjs-cloudflare build)
// ローカル開発: npm run preview (opennextjs-cloudflare build && opennextjs-cloudflare preview)
// デプロイ: npm run deploy (opennextjs-cloudflare build && opennextjs-cloudflare deploy)
// see: https://opennext.js.org/cloudflare/get-started
export default defineCloudflareConfig({
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
});
