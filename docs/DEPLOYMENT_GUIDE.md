# Deployment Guide（〆トラ）

目的: ローカルから本番（Cloudflare Workers）まで迷わずつなげる。

## 1) 環境構成

| 環境       | 用途                                                     |
| ---------- | -------------------------------------------------------- |
| local      | ローカル開発（`npm run dev`　または　`npm run preview`） |
| production | 本番（Cloudflare Workers）                               |

## 2) 環境変数

- 雛形: [.env.example](../.env.example)
- ルール:
  - `.env` はコミットしない（`.gitignore`）
  - 本番シークレットは `wrangler secret put <VAR_NAME>` で設定する
  - 非シークレット変数は `wrangler.toml` の `[vars]` に記載する
  - 「何が必須か」は `.env.example` に全量記載する

## 3) デプロイ手順

```bash
# 1. 依存関係インストール
npm install

# 2. 本番シークレット登録（初回のみ / 変更時）
wrangler secret put DATABASE_URL
wrangler secret put AUTH_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put CRON_SECRET

# 3. DB マイグレーション（Neon 本番に対して実行）
npx prisma migrate deploy

# 4. デプロイ
npm run deploy
```

`npm run deploy` の実体は `wrangler deploy`（`open-next.config.ts` 経由で Next.js を Cloudflare Workers 向けにビルド）。

## 4) Cron の設定

Cron スケジュールは `wrangler.toml` の `[triggers] crons` で管理する。
デプロイ後に Cloudflare Dashboard > Workers & Pages > [project] > Triggers > Cron Triggers でスケジュールを確認する。

```toml
# wrangler.toml（example）
[triggers]
crons = ["*/10 * * * *"]   # 10分おき
```

## 5) ロールバック方針

- コード: `git revert <commit> && git push origin main && npm run deploy`
- DB 変更がある場合: 追加カラムのみの場合はロールバック不要。破壊的変更は段階リリースにする。

## 6) リリースノート

変更履歴は [CHANGELOG.md](../CHANGELOG.md) を更新する（PR マージのたびに `Unreleased` に1行追記）。
