# Development Guide

スタック: Next.js (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL

## 開発フロー

- PRD→設計→Issue化の順で決める
  - PRD: [docs/PRD.md](PRD.md)
  - 設計メモ: [docs/architecture.md](architecture.md)
  - Issue一覧: [docs/MVP_BACKLOG.md](MVP_BACKLOG.md)
- Issue に「背景」「目的」「非目的」「受け入れ条件（AC）」を書く
- 1 Issue = 1 PR で小さく進める（半日以内の粒度）

## Done定義（最小）

以下が揃ったら、そのIssueはDoneにします。

- [ ] AC を満たす
- [ ] エラー時/空状態の最低限がある（該当する場合）
- [ ] 手動確認手順がPRに書かれている
- [ ] 影響があるドキュメント（PRD/設計/チェックリスト）を更新した

## ブランチ運用（最小）

- `main`: 常にデプロイ可能
- ブランチ名（例）: `feat/123-short-title` / `fix/456-short-title`

## 環境変数

- 雛形: [.env.example](../.env.example)
- ローカル用: `.env`（コミットしない）
- 秘密情報は README やドキュメントに貼らない

## 受け入れ条件（PR記述の型）

- [ ] 期待する動作が説明されている
- [ ] エッジケースが列挙されている
- [ ] 破壊的変更の有無が明記されている
