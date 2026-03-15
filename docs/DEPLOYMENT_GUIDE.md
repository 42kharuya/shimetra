# Deployment Guide（テンプレ）

目的: 初学者でも「ローカル→本番」を迷わずつなげる。

## 1) 最低限の環境

- local: ローカル開発
- prod: 本番

余裕があれば:

- staging: 本番同等（リリース前確認用）

## 2) 環境変数

- 雛形: [.env.example](../.env.example)
- ルール:
  - `.env` はコミットしない（[.gitignore](../.gitignore)）
  - 本番はホスティング側の管理画面等に設定する
  - 「何が必須か」をREADMEに書く（派生リポジトリ側）

## 3) デプロイ手順（テンプレ）

1. `main` にマージ（PRでレビュー/確認）
2. 本番デプロイが走る（手動/自動は派生先で決める）
3. 本番スモークテスト（[docs/LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)）
4. 問題があればロールバック（[docs/RUNBOOK_TEMPLATE.md](RUNBOOK_TEMPLATE.md)）

## 4) ロールバック方針（先に決める）

- 直前バージョンへ戻す手段:
- DB変更がある場合の戻し方:
  - 破壊的変更は避け、必要なら段階リリースにする

## 5) リリースノート

- 変更履歴は [CHANGELOG.md](../CHANGELOG.md) を更新する（最小でOK）
