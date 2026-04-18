# AGENTS.md — docs/ ドキュメントルール

このファイルは `docs/` ディレクトリに適用される**局所ルール**です。

## ソースオブトゥルース（優先順位）

1. `docs/PRD.md` — 仕様の正
2. `docs/ARCHITECTURE.md` — 設計の正
3. `.github/copilot-instructions.md` / `AGENTS.md` — 開発ルールの正

## ドキュメント更新ルール

- コードを変更したら、対応するドキュメント（README / 設計 / チェックリスト等）の更新要否を必ず確認する
- 仕様変更は `docs/PRD.md` へ反映してから実装に着手する
- アーキテクチャ変更は `docs/ARCHITECTURE.md` を先に更新する

## ドキュメント一覧と用途

| ファイル              | 用途                                         |
| :-------------------- | :------------------------------------------- |
| `PRD.md`              | プロダクト要件定義（ゴール・機能・スコープ） |
| `ARCHITECTURE.md`     | システム設計・技術構成                       |
| `development.md`      | 開発環境セットアップ手順                     |
| `ANALYTICS_SPEC.md`   | 計測設計・KPI定義                            |
| `DEPLOYMENT_GUIDE.md` | デプロイ手順                                 |
| `RUNBOOK.md`          | 障害対応ランブック                           |
