# Changelog

このプロジェクトの変更履歴（MVP運用向けの最小フォーマット）。

## Unreleased

- feat: メールマジックリンク認証を追加（/login でメール入力→リンク送付→クリックでログイン/サインアップ、未ログイン時は /login へリダイレクト）
- feat: メール送信基盤を追加（EMAIL_PROVIDER=console/resend で切替、送信失敗は ok:false で返却しログ出力）
- db: Prisma + Postgres スキーマ追加（users / deadline_items / subscriptions / notification_deliveries / magic_link_tokens）
- docs: 技術選定/デプロイ/SEO-GTM/サポート運用/ポストモーテムのテンプレを追加
- ops: Runbook/Launch Checklist/Analytics テンプレを補強
- github: Experiment/Incident のIssueテンプレを追加

## 0.1.0

- Initial template
