# MVP Backlog Template（PRD→Issue分割の型）

目的: [docs/PRD_TEMPLATE.md](PRD_TEMPLATE.md) の Must を、**10〜20個のIssue**に落とします。
1 Issue は「1〜3時間〜半日」で終わる粒度を目安にします。

## Issueの書き方（テンプレ）

- タイトル:
- 背景/目的:
- 非目的:
- 受け入れ条件（AC）: 1〜3個
- 依存関係:
- 推定: S/M/L

---

## 典型バックログ例（必要なものだけ採用）

### 企画・土台

- PRD確定（Won’t含む）
- ADR 0001 作成（画面/データ/主要リスク）

### UI/UX

- LP（説明・CTA）
- サインアップ導線（必要なら）
- 空状態/エラー状態（最低限）

### データ/API

- データモデル定義（最小）
- 作成/一覧/詳細（必要な分だけ）

### 計測

- イベント設計を確定（[docs/ANALYTICS_SPEC_TEMPLATE.md](ANALYTICS_SPEC_TEMPLATE.md)）
- signup/activation の送信
- ダッシュボード（最低限）

### 運用

- ログの見方（Runbookを埋める）
- ロールバック手順（Runbookに記載）
- .env.example 整備

### マーケ

- 投稿計画（7日分）
- 改善実験 3本（[docs/GROWTH_PLAYBOOK.md](GROWTH_PLAYBOOK.md)）
