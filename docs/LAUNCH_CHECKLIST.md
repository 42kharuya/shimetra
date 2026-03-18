# ローンチチェックリスト（MVP）

## 1. 法務・信頼（最低限）

- [x] 利用規約（Terms）を用意した（`/terms` ページ作成済み）
- [x] プライバシーポリシー（Privacy）を用意した（`/privacy` ページ作成済み）
- [x] お問い合わせ導線（メール/フォーム）を用意した（フッターの `support@example.com` ← **ローンチ前に実際のアドレスに変更すること**）
- [x] データ削除依頼の方針（最低限の手順）を決めた（プライバシーポリシーに記載：メールで受付）
- [x] 年齢制限/未成年配慮が必要なら明記した（就活対象者は成人想定のため特段の記載不要と判断）

## 2. プロダクト（ユーザー体験）

- [ ] ハッピーパス（登録→利用→完了）が通る
- [ ] 空状態（データなし）に対応している
- [ ] エラー状態（通信失敗/権限/バリデーション）に対応している
- [ ] スマホ表示で崩れない（主要画面）
- [ ] パフォーマンスが致命的に遅くない（体感）

## 3. 計測（Analytics）

- [ ] 重要イベントを定義した（例：signup / activation / purchase）
- [ ] イベント名とプロパティをドキュメント化した
- [ ] 最低限のダッシュボード（KPI）を用意した
- [ ] 同意/クッキー等の扱いが必要なら対応した（地域要件次第）
- [ ] UTMの命名ルールを決めた（可能なら）

参考テンプレ:

- [docs/ANALYTICS_SPEC_TEMPLATE.md](ANALYTICS_SPEC_TEMPLATE.md)
- [docs/SEO_GTM_CHECKLIST.md](SEO_GTM_CHECKLIST.md)

## 4. 運用（Ops）

- [ ] エラーログを確認できる（最低限）
- [ ] 監視/アラート（最低限）を用意した（例：障害時に気づける）
- [ ] ロールバック手順（前の版へ戻す）を決めた
- [ ] バックアップ/復旧の方針がある（可能な範囲で）
- [ ] `.env.example` が揃っている
- [ ] README にローカル起動手順がある

参考テンプレ:

- [docs/RUNBOOK_TEMPLATE.md](RUNBOOK_TEMPLATE.md)
- [.env.example](../.env.example)
- [docs/DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 5. マーケ・導線

- [ ] ランディングページ（LP）または説明ページがある
- [ ] スクリーンショット/使い方が1つ以上ある
- [ ] CTA（登録/開始/購入）が明確
- [ ] 投稿計画（最初の1週間分）を決めた
- [ ] 最低限のSEO/OGが整っている（できる範囲で）

参考テンプレ:

- [docs/GROWTH_PLAYBOOK.md](GROWTH_PLAYBOOK.md)
- [docs/SEO_GTM_CHECKLIST.md](SEO_GTM_CHECKLIST.md)

## 6. QA / テスト（ローンチ前）

> 詳細手順: [docs/QA_CRITICAL_PATH.md](QA_CRITICAL_PATH.md)

### 自動テスト（ユニット）

- [ ] `npm run test:auth` — JWT・トークン生成
- [ ] `npm run test:stripe` — Stripe env バリデーション
- [ ] `npm run test:webhook` — `resolveSubscriptionPlan` 全パターン
- [ ] `npm run test:deadlines && npm run test:format` — バリデーション・フォーマット

### スモークテスト（APIレベル）

- [ ] `npm run test:smoke`（dev サーバー起動後）— 認証/課金/Cron の疎通確認

### 手動確認（必須: A/B/C のみ）

- [ ] **A. 認証**: Magic Link 送信 → verify → `/dashboard` 遷移
- [ ] **B. データ保存**: 締切 CRUD・Free ユーザー 11件目で 403
- [ ] **C. 課金**: テストカード決済 → DB に `plan=pro, status=active` が入る

参考テンプレ:

- [docs/QA_CRITICAL_PATH.md](QA_CRITICAL_PATH.md)

## 7. リリース手順（当日）

### 7-1. ローンチ前（デプロイ直後・公開前）

- [ ] `main` ブランチを最新にして Vercel 自動デプロイが完了していることを確認
- [ ] Vercel Dashboard > Deployments でビルドが **Ready** になっていることを確認
- [ ] 本番環境変数を全項目チェック（後述の 7-3 参照）
- [ ] `prisma migrate status` を本番 DB で確認（未適用マイグレーション = ゼロ）
- [ ] タグを切る（任意）: `git tag v0.1.0 && git push origin v0.1.0`

### 7-2. スモークテスト手順（本番 URL で実行）

> 前提: `BASE_URL` に本番 URL をセットして実行する。FAIL が 1 件でもあればロールバックに進む。

```bash
# ① 自動スモーク（認証・課金・Cron 疎通確認）
BASE_URL=https://your-app.vercel.app bash scripts/smoke-test.sh
```

手動確認（必須 3 導線）:

- [ ] **A. 認証**: ブラウザで `https://your-app.vercel.app/login` を開き、実メールアドレスでマジックリンクを送信 → メール到達 → クリックで `/dashboard` にリダイレクトされる
- [ ] **B. データ保存**: `/deadline/new` で締切を 1 件登録 → ダッシュボードに表示される
- [ ] **C. 課金**: Stripe テストカード `4242 4242 4242 4242` でチェックアウト完了 → DB の `subscriptions.plan = 'pro', status = 'active'` を確認
- [ ] **D. Cron 手動実行**: `curl -X POST https://your-app.vercel.app/api/cron/notify -H "Authorization: Bearer <CRON_SECRET>"` → `200 OK` を確認

### 7-3. 本番環境変数チェックリスト

| 変数 | 確認内容 |
|------|---------|
| `DATABASE_URL` | 本番 DB の接続文字列（`localhost` が入っていないこと） |
| `AUTH_SECRET` | 32 バイト以上のランダム文字列 |
| `RESEND_API_KEY` | `re_` で始まる本番キー |
| `EMAIL_FROM` | Resend で認証済みドメインのアドレス |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app`（末尾スラッシュなし） |
| `STRIPE_SECRET_KEY` | `sk_live_` で始まる本番キー（テスト時は `sk_test_`） |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Webhooks の `whsec_` で始まる本番用署名シークレット |
| `CRON_SECRET` | 32 バイト以上のランダム文字列 |

### 7-4. ロールバック手順

> スモークテストで FAIL が出た場合、または公開後に S1 障害が発生した場合に実行する。

**コードのロールバック（5 分以内に完了）**

- [ ] 1. Vercel Dashboard > [project] > **Deployments** を開く
- [ ] 2. 問題のあるデプロイの 1 つ前のエントリを選択 → **Redeploy** をクリック
  - 代替: `git revert HEAD --no-edit && git push origin main`（Vercel が自動再デプロイ）
- [ ] 3. Vercel が **Ready** になるまで待つ（通常 1〜2 分）
- [ ] 4. 再度スモークテストを実行して導線が回復したことを確認
  ```bash
  BASE_URL=https://your-app.vercel.app bash scripts/smoke-test.sh
  ```

**DB マイグレーションのロールバック（必要な場合のみ）**

- [ ] 1. 旧コードに戻す（上記の手順）
- [ ] 2. 破壊的変更（カラム削除など）を行っていた場合のみ: 手動 SQL で元の状態に戻す
- [ ] 3. `prisma migrate resolve --rolled-back <migration_name>` でマイグレーション状態を修正
- [ ] 4. Prisma Studio または SQL クエリでデータ整合性を確認

**ロールバック後の最終確認**

- [ ] `/login` でマジックリンクが送付される（メール到達まで確認）
- [ ] `/dashboard` が 200 で表示される
- [ ] `POST /api/stripe/webhook`（Stripe からテストイベント送信）が 200 を返す
- [ ] `POST /api/cron/notify` が 200 を返す（`Authorization: Bearer <CRON_SECRET>`）

### 7-5. ローンチ後 24 時間モニタリング

- [ ] Vercel Logs を 30 分おきに確認（5xx が出ていないこと）
- [ ] Stripe Dashboard > Events で Webhook の受信状態を確認
- [ ] DB: `notification_deliveries` テーブルで `status = 'failed'` がないことを確認
- [ ] 初回ユーザー登録を確認（`users` テーブル）
- [ ] ローンチ後 24 時間の監視担当（自分）を確保する
