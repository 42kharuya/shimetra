# QA クリティカル導線 テスト計画（MVP）

> **対象**: 登録 → 初回成功体験 → 課金 の最重要フローのみ  
> **方針**: 自動テストで担保できないDB結合・E2Eのみ手動確認する  
> **更新基準**: APIの入出力仕様変更・新機能追加時に見直す

---

## テスト実行順序（推奨）

```
自動テスト（ユニット）→ スモークテスト → 手動確認（DB統合）→ 本番スモーク
```

---

## フェーズ 1: 自動テスト（ユニット）

> `npm run test:<name>` で実行。DB不要。

| スクリプト | カバー範囲 | 実行コマンド |
|-----------|------------|------------|
| auth | JWT生成・検証・改ざん検知、token生成 | `npm run test:auth` |
| stripe | env未設定エラー、Stripeクライアント初期化 | `npm run test:stripe` |
| webhook | `resolveSubscriptionPlan` ロジック全パターン | `npm run test:webhook` |
| deadlines | バリデーション、フォーマット | `npm run test:deadlines && npm run test:format` |
| notify | offsetLabel、メールHTML生成、定数 | `npx tsx src/lib/notifications/__tests__/notify.test.ts` |
| mailer | メール送信モック | `npm run test:mailer` |

**合格基準**: 全テスト 0 failed

---

## フェーズ 2: スモークテスト（APIレベル自動）

> dev サーバー起動後に実行する。

```bash
npm run dev &   # 別ターミナルで起動済みであること
bash scripts/smoke-test.sh
```

カバー範囲:
- POST /api/auth/magic-link バリデーション (200/400)
- GET /api/auth/verify 不正トークン (302/307)
- POST /api/deadlines 未認証 (401)
- POST /api/stripe/checkout 未認証 (401)、GET (405)
- POST /api/cron/notify 未認証・不正シークレット (401)
- ページ疎通 (/, /login, /dashboard, /billing)

**合格基準**: 0 failed（SKIP は手動確認で補完）

---

## フェーズ 3: 手動確認（DB統合・ブラウザ）

### 3-A. 認証フロー（Magic Link）

**前提**: `dev` 環境起動中、`EMAIL_PROVIDER=console`（ログにURLが出る）

| # | 操作 | 期待値 | 確認済み |
|---|------|--------|---------|
| A-1 | `/login` を開き、有効なメールを入力して送信 | 「メールを送りました」メッセージが出る | ☐ |
| A-2 | ターミナルに出力された `LOGIN URL` をコピーしてブラウザで開く | `/dashboard` にリダイレクトされセッションが確立 | ☐ |
| A-3 | セッション確立後 `/login` にアクセス | `/dashboard` にリダイレクト（再ログイン不要） | ☐ |
| A-4 | 期限切れリンク（30分超過 or 2回目使用）をクリック | `/login?error=...` にリダイレクト | ☐ |
| A-5 | ブラウザでCookieを削除して `/dashboard` にアクセス | `/login` にリダイレクト | ☐ |

---

### 3-B. 締切データ保存（Deadlines CRUD）

**前提**: A-2 完了後（ログイン済み）

| # | 操作 | 期待値 | 確認済み |
|---|------|--------|---------|
| B-1 | `/deadline/new` で必須項目を入力し「作成する」 | `/dashboard` に戻り、作成した締切が一覧に表示 | ☐ |
| B-2 | 必須項目を空にして「作成する」 | フォームにバリデーションエラーが表示される（送信されない） | ☐ |
| B-3 | ダッシュボードから締切を削除 | 一覧から消える（リロードしても消えている） | ☐ |
| B-4 | Free ユーザーで10件作成後、11件目を作成しようとする | `403 FREE_LIMIT_EXCEEDED` が返る（UIにアップグレード誘導が出る） | ☐ |
| B-5 | B-4 の状態でダッシュボードを表示 | 「上限(10件)に達しました」バナーが表示される | ☐ |

---

### 3-C. 課金フロー（Stripe Checkout → Webhook → Pro 昇格）

**前提**: Stripe テストモード、`stripe listen` 起動済み、ログイン済み

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

| # | 操作 | 期待値 | 確認済み |
|---|------|--------|---------|
| C-1 | `/billing` の「Pro にアップグレード」ボタンをクリック | Stripe Checkout ページに遷移する | ☐ |
| C-2 | テストカード `4242 4242 4242 4242` で支払い完了 | `/billing/success` に戻る | ☐ |
| C-3 | Stripe ダッシュボード（テスト）でサブスクリプション確認 | `active` ステータスのサブスクリプションが作成されている | ☐ |
| C-4 | DB で `subscriptions` テーブルを確認 | `plan=pro, status=active` のレコードが存在する | ☐ |
| C-5 | C-4 完了後、11件目の締切作成を試みる | 正常に作成できる（Proユーザーは制限なし） | ☐ |
| C-6 | `/billing` でカスタマーポータルを開く | Stripe ポータルに遷移し、プラン/支払い情報を確認できる | ☐ |

**DB確認コマンド（Prisma Studio）**:
```bash
npm run db:studio
# → ブラウザで subscriptions テーブルを確認
```

---

### 3-D. Stripe Webhook（サブスクリプション変更）

**前提**: C-2 完了（Pro ユーザー存在）、`stripe listen` 起動済み

| # | 操作 | 期待値 | 確認済み |
|---|------|--------|---------|
| D-1 | Stripe ダッシュボードでサブスクリプションをキャンセル | DB の `status=canceled` に更新される | ☐ |
| D-2 | D-1 後、期間終了日（current_period_end）が未来の場合 | `plan=pro` のまま（猶予期間中） | ☐ |
| D-3 | 期間終了後（手動でDBのcurrent_period_endを過去に変更） | `/dashboard` でFree制限が適用される | ☐ |

---

### 3-E. 通知 Cron

**前提**: `CRON_SECRET` を `.env` に設定済み

| # | 操作 | 期待値 | 確認済み |
|---|------|--------|---------|
| E-1 | 正しいシークレットで Cron を手動実行 | `{ ok: true, result: { processed, sent, failed } }` が返る | ☐ |
| E-2 | Free ユーザーに対して Cron を実行 | `offset_minutes=1440`(24h) の通知のみ送信 | ☐ |
| E-3 | Pro ユーザーに対して Cron を実行 | `4320/1440/180` の通知がそれぞれ送信 | ☐ |
| E-4 | 同一条件で Cron を2回実行 | 2回目は `sent=0`（重複防止） | ☐ |

```bash
# E-1 実行コマンド
curl -X POST http://localhost:3000/api/cron/notify \
  -H "Authorization: Bearer $(grep CRON_SECRET .env | cut -d= -f2)"
```

---

### 3-F. エラー状態（空状態・通信失敗）

| # | 操作 | 期待値 | 確認済み |
|---|------|--------|---------|
| F-1 | 初めてログインしたユーザーのダッシュボード | 空状態UI が表示される（エラーにならない） | ☐ |
| F-2 | ネットワーク切断状態でフォーム送信 | エラーメッセージが表示される（クラッシュしない） | ☐ |
| F-3 | `/dashboard` を未ログインで直打ち | `/login` にリダイレクトされる | ☐ |
| F-4 | 存在しない締切ID `/deadline/new` → 手動で存在しないIDでDELETE | 404 または適切なエラーが返る | ☐ |

---

## フェーズ 4: 本番スモークテスト（デプロイ後）

```bash
BASE_URL=https://your-app.vercel.app bash scripts/smoke-test.sh
```

追加で手動確認:
- [ ] 本番環境で Magic Link メールが届く（実メール送信）
- [ ] 本番 Stripe で少額決済テスト（テストカード使用）
- [ ] Vercel のログにエラーがないことを確認

---

## 合格基準サマリー

| フェーズ | 基準 |
|----------|------|
| フェーズ1 ユニット | 全テスト 0 failed |
| フェーズ2 スモーク | 0 failed（SKIP除く） |
| フェーズ3 手動 A〜C | A-1〜A-5, B-1〜B-5, C-1〜C-5 全チェック済み |
| フェーズ4 本番 | スモーク 0 failed + メール到達確認 |

> フェーズ3 の D/E/F は時間があれば確認（必須は A/B/C）
