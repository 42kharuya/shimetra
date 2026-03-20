# コードレビュー結果

> 実施日: 2026-03-20

## ① プロジェクト全体の把握

**〆トラ（MVP）** — 就活生向け締切管理SaaS

| 項目           | 内容                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| フレームワーク | Next.js 15 (App Router) + TypeScript 5 + Tailwind CSS 3                                    |
| DB             | Prisma 7 + Neon PostgreSQL（`@neondatabase/serverless`、WebSocket 直接接続）               |
| 認証           | Magic Link（DB トークン、`crypto.randomBytes`）+ JWT セッション（`jose`、httpOnly Cookie） |
| 課金           | Stripe                                                                                     |
| 通知           | メール（Resend）+ Cloudflare Cron Triggers                                                 |
| デプロイ       | Cloudflare Workers（`@opennextjs/cloudflare` v1）                                          |

## ② 重大な不備・エラー（今すぐ対応推奨）

### 2-1. 環境変数の未検証・型不安全な参照

複数箇所で `process.env.XXX` を直接 `!`（Non-null assertion）や型キャストなしで参照している可能性。`src/lib/` 配下の初期化ファイルでの未チェック参照は、デプロイ後に実行時エラーになる。

### 2-2. Prisma マイグレーション未適用リスク

`prisma/` ディレクトリにスキーマはあるが、`migrations/` の適用状態が本番と一致しているか確認が必要。`prisma migrate status` が `Unreleased` のままだとAPIが500を返す。

### 2-3. `open-next.config.ts` と `wrangler.toml` の二重デプロイ設定

Vercel と Cloudflare Workers の両方に設定ファイルがある。どちらが「正」として運用するか明確でなく、環境変数の差異が本番障害の原因になりうる。

### 2-4. `src/app/api/cron/notify/route.ts` のエラーハンドリング不足

`findAndDeliverNotifications` が部分失敗（一部メール送信失敗）した場合でも `500` を返す設計になっている可能性がある。Cron の冪等性は確保されているが、部分失敗時のステータスコードが曖昧。

### 2-5. Magic Link トークンの有効期限切れ後の挙動未確認

`/api/auth/verify` でトークン検証失敗時に `302/307` リダイレクトは確認されているが、期限切れと改ざんで**同じエラー応答**になっているか要確認。ユーザー体験に影響する。

## ③ 将来的に直した方がいい箇所

### 3-1. バリデーションスキーマが `src/lib/deadlines/validate.ts` に集中

`validate.ts` が肥大化しやすい構造。Zod などのスキーマライブラリへの移行を将来的に検討推奨。

### 3-2. `src/app/page.tsx` にベタ書きされている定数

`FREE_FEATURES`・`PRO_FEATURES` がページコンポーネントに直接定義されている。プラン仕様変更時にUI側のみ修正漏れが起きる。料金設定は設定ファイルや定数ファイルに分離すべき。

### 3-3. テスト実行が `npx tsx` による単純スクリプト方式

`src/lib/deadlines/__tests__/format.test.ts` が `node:assert` + `npx tsx` 実行形式。Vitest などのテストランナー導入でカバレッジ計測・CI統合が容易になる。

### 3-4. `CHANGELOG.md` の `Unreleased` がずっと未リリース

`CHANGELOG.md` の `Unreleased` セクションに多数の変更が積み上がっており、バージョンタグ（`v0.1.0` など）と紐付けられていない。

### 3-5. `src/app/terms/page.tsx` の法務テキストがハードコード

`terms/page.tsx` の利用規約がコード内に直書きされており、法務内容修正のたびにデプロイが必要になる。

## ④ 運用上不要な可能性のあるもの

### 4-1. `open-next.config.ts` と `wrangler.toml`

Vercel デプロイが正式運用であれば、Cloudflare Workers 向けの設定ファイルは不要。混在により環境依存のバグが起きやすい。

### 4-2. `docker-compose.yml`

ローカルDB用と推測されるが、`README.md` に起動手順の記載がなければ、開発者が使うか不明。実際に使われているか確認が必要。

### 4-3. ビルド成果物（`.next/` / `.open-next/`）

`.gitignore` で除外されているはずだが、リポジトリ構造の説明にこれらが含まれている点は確認要。

## ⑤ ディレクトリ構造の改善案

### 現状の `src/` の問題点

- `app/` にページと API ルートが混在
- `lib/` にビジネスロジックが平置き

### 改善案

```
src/
  app/
    (routes)/           # ページのみ
    api/                # API ルートのみ（現状維持でOK）
  features/             # ドメインごとに分割
    deadlines/
      validate.ts
      format.ts
      gate.ts
      __tests__/
    auth/
      session.ts
      token.ts
      __tests__/
    billing/
    notifications/
  lib/                  # 汎用ユーティリティのみ（DB接続・メール送信基盤など）
    prisma.ts
    stripe.ts
    mailer/
  config/               # 定数・プラン定義など
```

`features/` 単位でのドメイン分割により、スケール時の見通しが良くなる。

## ⑥ こうすればもっと良くなる

### 6-1. 環境変数の一元バリデーション（起動時チェック）

`src/lib/env.ts` のようなファイルを作り、アプリ起動時に必須環境変数を検証してフェイルファストにする。

```ts
// src/lib/env.ts（例）
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(1),
  MAGIC_LINK_SECRET: z.string().min(32),
  // ...
});

export const env = envSchema.parse(process.env);
```

### 6-2. APIルートへのレート制限

`/api/auth/magic-link`（Magic Link送信）に対してレート制限がないと、メール爆弾攻撃を受ける可能性がある。Vercel の Edge Middleware か Upstash Redis での実装を推奨。

### 6-3. `smoke-test.sh` のCI組み込み

`scripts/smoke-test.sh` が手動実行のみ。GitHub Actions の `on: push` トリガーでdev環境に対して自動実行する仕組みにすると、デグレ検知が自動化できる。

### 6-4. エラー監視（Sentry）の有効化

`RUNBOOK.md` に `SENTRY_DSN` 設定時との記載があるが、現状未設定の可能性が高い。MVP公開後すぐにエラー検知できるよう、Sentry の無料プランを早期に設定推奨。

### 6-5. `notification_deliveries` の失敗アラート

DB の `status = 'failed'` を検知して自動アラートする仕組みがない。簡単な実装として、Cron 実行後に `failed` 件数が閾値を超えたらメール通知する処理を追加すると運用負荷が下がる。

## 対応優先度サマリー

| 優先度 | 項目                         | 種別           |
| ------ | ---------------------------- | -------------- |
| 🔴 高  | 2-1. 環境変数の未検証        | バグリスク     |
| 🔴 高  | 2-3. 二重デプロイ設定        | 本番障害リスク |
| 🔴 高  | 2-4. Cron エラーハンドリング | バグリスク     |
| 🟡 中  | 2-5. Magic Link エラー応答   | UX             |
| 🟡 中  | 6-2. レート制限なし          | セキュリティ   |
| 🟡 中  | 6-4. Sentry 未設定           | 運用           |
| 🟢 低  | 3-2. 定数のハードコード      | 保守性         |
| 🟢 低  | 3-3. テストランナー未整備    | 開発効率       |
| 🟢 低  | 4-1. 不要な設定ファイル      | 整理           |
| 🟢 低  | ⑤ ディレクトリ構造改善       | 保守性         |
