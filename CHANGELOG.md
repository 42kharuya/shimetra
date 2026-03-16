# Changelog

このプロジェクトの変更履歴（MVP運用向けの最小フォーマット）。

## Unreleased

- feat: 締切作成フォーム（/deadline/new）を実装（企業名/種別/締切日時の必須入力・API送信・エラー表示・作成後 /dashboard へ遷移）
- feat: ダッシュボードUI を実装（締切近い順表示・ステータスをセレクトで即更新・0件時に2件登録を促す空状態UI）
- feat: LP（/）実装（価値提案・Free/Pro差分・価格 980円/月・CTA → /login）
- feat: `PATCH /api/deadlines/:id` を追加（ステータス更新・部分更新、submitted 時のみ status_changed_at を設定、ユーザースコープ保証）
- feat: `DELETE /api/deadlines/:id` を追加（ログインユーザーの自分のアイテムのみ削除可）
- feat: `GET /api/deadlines` を追加（締切アイテム一覧取得API、deadline_at 昇順・ログインユーザーのみ返却）
- feat: `POST /api/deadlines` を追加（締切アイテム作成API、入力バリデーション・Free 10件制限・ユーザースコープ保証）
- feat: メールマジックリンク認証を追加（/login でメール入力→リンク送付→クリックでログイン/サインアップ、未ログイン時は /login へリダイレクト）
- feat: メール送信基盤を追加（EMAIL_PROVIDER=console/resend で切替、送信失敗は ok:false で返却しログ出力）
- db: Prisma + Postgres スキーマ追加（users / deadline_items / subscriptions / notification_deliveries / magic_link_tokens）
- docs: 技術選定/デプロイ/SEO-GTM/サポート運用/ポストモーテムのテンプレを追加
- ops: Runbook/Launch Checklist/Analytics テンプレを補強
- github: Experiment/Incident のIssueテンプレを追加

## 0.1.0

- Initial template
