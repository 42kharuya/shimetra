# Runbook（就活締切トラッカー）

MVP の運用・障害対応・ロールバック手順を 1 ページにまとめる。
詳細ポストモーテムは [docs/POSTMORTEM_TEMPLATE.md](POSTMORTEM_TEMPLATE.md) を利用すること。

---

## 1. 最重要導線（守るもの）

| 優先度 | 導線 | 壊れたときの影響 |
|--------|------|-----------------|
| S1 | ログイン（マジックリンク送付 → セッション発行） | 全ユーザーがアクセス不能 |
| S1 | Stripe Webhook 受信（`/api/stripe/webhook`） | 課金状態が DB に反映されない |
| S1 | 通知 Cron（`/api/cron/notify`） | 締切前メールが届かない |
| S2 | 締切登録/更新（`/api/deadlines`） | コア体験が使えない |
| S2 | Stripe Checkout（`/api/stripe/checkout`） | アップグレードができない |

---

## 2. シークレット管理（Cron / Webhook）

### 設定場所

| 変数 | 本番設定先 | 備考 |
|------|-----------|------|
| `CRON_SECRET` | Vercel > Settings > Environment Variables > **Production** | 生成: `openssl rand -base64 32` |
| `STRIPE_WEBHOOK_SECRET` | Vercel > Settings > Environment Variables > **Production** | Stripe Dashboard > Developers > Webhooks > Signing secret |
| `STRIPE_SECRET_KEY` | Vercel > Settings > Environment Variables > **Production** | `sk_live_xxxxx`（本番は live キーを使う） |
| `AUTH_SECRET` | Vercel > Settings > Environment Variables > **Production** | 生成: `openssl rand -base64 32` |

### ローカル vs 本番

| 環境 | Cron 実行 | Webhook 受信 |
|------|-----------|-------------|
| ローカル | `curl -X POST http://localhost:3000/api/cron/notify -H "Authorization: Bearer <CRON_SECRET>"` | `stripe listen --forward-to localhost:3000/api/stripe/webhook`（`whsec_xxx` が出る） |
| Vercel | `vercel.json` の `crons` 設定で自動呼び出し。Vercel が `CRON_SECRET` を Bearer トークンとして付与する | Stripe Dashboard に `https://<APP_URL>/api/stripe/webhook` を登録し、`STRIPE_WEBHOOK_SECRET` を設定 |

### シークレットローテーション手順

1. 新しいシークレットを生成（`openssl rand -base64 32`）
2. Vercel 環境変数を更新して Redeploy
3. Stripe Webhook の場合: 旧エンドポイントを残したまま新エンドポイントを追加 → 動作確認後に旧を削除
4. ローカル `.env` を更新

---

## 3. ログの場所

| ログ種別 | 確認場所 |
|---------|---------|
| API / Cron / Webhook の実行ログ | Vercel Dashboard > [project] > **Logs** タブ（`/api/cron/notify`, `/api/stripe/webhook` でフィルタ） |
| メール送信ログ | 同 Logs タブで `sendEmail` or `EMAIL_PROVIDER` で検索 |
| エラー監視 | Sentry（`SENTRY_DSN` 設定時）または Vercel Logs の `level:error` フィルタ |
| 通知送信結果 | DB > `notification_deliveries` テーブル（`status` = `sent` / `failed`, `error` カラム） |
| 課金状態 | DB > `subscriptions` テーブル + Stripe Dashboard > Events |

---

## 4. 一次切り分け（障害発生時）

### 4-1. Cron 通知が届かない

```
1. Vercel Logs で POST /api/cron/notify の実行を確認
   → 実行されていない: Vercel Cron 設定 (vercel.json > crons) と CRON_SECRET を確認
   → 500 エラー: ログ詳細で DB 接続 / メール送信エラーを確認

2. DB で notification_deliveries を確認
   → status=failed: error カラムにエラー詳細あり
   → レコードなし: Cron 自体が未実行 or 抽出クエリのバグ

3. メール送信側の確認
   → EMAIL_PROVIDER=resend の場合: Resend Dashboard > Logs で送信状態を確認

4. 手動再実行（冪等設計 = 再実行しても二重送信しない）:
   curl -X POST https://<APP_URL>/api/cron/notify \
     -H "Authorization: Bearer <CRON_SECRET>"
```

### 4-2. Stripe Webhook が反映されない

```
1. Stripe Dashboard > Developers > Webhooks > イベント履歴を確認
   → 失敗: レスポンスコードと本文を確認
   → 未送信: エンドポイント URL と有効化状態を確認

2. Vercel Logs で POST /api/stripe/webhook の実行を確認
   → 400: 署名検証失敗 → STRIPE_WEBHOOK_SECRET が本番用の値か確認
   → 500: DB 接続 or Prisma エラーの可能性

3. Stripe から手動 Resend:
   Stripe Dashboard > Webhooks > 対象イベント > "Resend" ボタン
   （subscriptions upsert は冪等なので何度でも再送可）
```

### 4-3. ログイン（マジックリンク）が届かない

```
1. Resend Dashboard > Logs でメール送信状態を確認（delivered / failed）
2. スパムフォルダを確認
3. Vercel Logs で POST /api/auth/magic-link の実行を確認
   → EMAIL_FROM が Resend で認証済みドメインか確認
   → RESEND_API_KEY が有効か確認
4. ローカルで EMAIL_PROVIDER=console に切り替えて動作確認
```

### 4-4. 全 API が 500 / DB 接続不能

```
1. Vercel Logs で DATABASE_URL に関するエラーを確認
2. Vercel > Settings > Environment Variables で DATABASE_URL が正しいか確認
3. DB ホスト（Supabase / Neon 等）のダッシュボードで稼働状況を確認
4. prisma migrate status で未適用マイグレーションがないか確認
```

---

## 5. ロールバック手順

### コードのロールバック

1. Vercel Dashboard > [project] > **Deployments** タブを開く
2. 問題のある Deployment の 1 つ前のコミットを選択 → **Redeploy**（同じ環境変数を引き継ぐ）
3. または Git で `git revert <commit>` して push → Vercel が自動デプロイ

```bash
# 直前コミットを戻す場合
git revert HEAD --no-edit
git push origin main
```

### DB マイグレーションのロールバック

> MVP 段階ではカラム削除・スキーマ破壊的変更は行わない方針。
> 追加のみのマイグレーションはロールバック不要（古いコードでも動く）。

破壊的変更が必要な場合:
1. 旧コードに戻す（上記）
2. Prisma で手動 SQL を実行してカラム/テーブルを元に戻す
3. `prisma migrate resolve --rolled-back <migration_name>` でマイグレーション状態を修正

### ロールバック後の確認（スモークテスト）

- [ ] `/login` でマジックリンクが送付される
- [ ] `/dashboard` が表示される（締切一覧が出る）
- [ ] `/api/stripe/webhook` が 200 を返す（Stripe からテストイベント送信）
- [ ] cron 手動実行が 200 を返す

---

## 6. 変更・更新時のチェックリスト

- [ ] 環境変数を追加/変更した → `.env.example` を更新し、Vercel に反映した
- [ ] Stripe Webhook イベントを追加した → Stripe Dashboard のエンドポイント設定を更新した
- [ ] DB スキーマを変更した → `prisma migrate deploy` を本番で実行した
- [ ] `vercel.json` の crons を変更した → Vercel デプロイ後にスケジュールを確認した
