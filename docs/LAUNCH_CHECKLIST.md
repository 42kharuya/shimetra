# ローンチチェックリスト（MVP）

## 1. 法務・信頼（最低限）

- [ ] 利用規約（Terms）を用意した
- [ ] プライバシーポリシー（Privacy）を用意した
- [ ] お問い合わせ導線（メール/フォーム）を用意した
- [ ] データ削除依頼の方針（最低限の手順）を決めた
- [ ] 年齢制限/未成年配慮が必要なら明記した

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

- [ ] バージョン/タグ（任意）を切る
- [ ] 本番環境の環境変数を確認する
- [ ] `BASE_URL=https://your-app.vercel.app npm run test:smoke` で本番スモーク実施
- [ ] 本番で Magic Link メールの到達確認（実メール）
- [ ] ローンチ後24時間の監視担当（自分）を確保する
