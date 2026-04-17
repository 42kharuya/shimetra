# GitHub Copilot 関連ファイルの比較と判断フロー

このドキュメントは、`AGENTS.md` / `instructions` / `agents` / `skills` / `workflows` の違いを、**どこに何を書くべきか**という観点で整理するための詳細ガイドです。

## 比較表

| 種類 | 適用範囲 | 常時適用 | 主な役割 |
| :--- | :--- | :--- | :--- |
| `AGENTS.md` | プロジェクト全体 | はい | 共通原則、変更姿勢、安全性 |
| `各ディレクトリ/AGENTS.md` | 特定ディレクトリ | はい | 局所文脈、構造、変更時の注意 |
| `.github/copilot-instructions.md` | リポジトリ全体 | はい | 応答・提案の共通ルール |
| `.github/instructions/*.instructions.md` | 特定パス | はい | パス単位の実装ルール、レビュー観点 |
| `.github/agents/` | 呼び出した時だけ | いいえ | 専門役割の付与 |
| `.github/skills/` | 呼び出した時だけ | いいえ | 定型作業、実行手順の支援 |
| `.github/workflows/` | 実行時 | いいえ | Cloud Agent の環境準備 |

## どこに何を書くか

### `AGENTS.md` に向いているもの

- どの変更でも共通で守ってほしい原則
- 安全性、確認優先ケース、検証姿勢
- 破壊的変更の扱い

### `各ディレクトリ/AGENTS.md` に向いているもの

- そのディレクトリの責務
- 関連ファイルや依存関係
- 変更影響が広がりやすい場所
- その場所で使う確認手順

### `.github/copilot-instructions.md` に向いているもの

- 応答トーン
- 結論の出し方
- 最小差分や推測回避などの普遍ルール

### `.github/instructions/*.instructions.md` に向いているもの

- パス単位のコーディング規約
- 設計やレビューの観点
- 技術スタック固有の実装方針

### `.github/agents/` に向いているもの

- レビュー役
- テスト生成役
- 調査役
- 特定タスク専用の役割定義

### `.github/skills/` に向いているもの

- lint 実行
- ログ解析
- 定型的な確認手順
- 一連の作業フロー

### `.github/workflows/` に向いているもの

- Cloud Agent が動くための依存関係セットアップ
- テストやビルドに必要な実行環境準備

## 判断フロー

次の順で判断すると整理しやすくなります。

1. **どの範囲に効く情報か？**
   - 全体なら `AGENTS.md` または `.github/copilot-instructions.md`
   - 特定ディレクトリや特定パスなら `各ディレクトリ/AGENTS.md` または `.github/instructions/*.instructions.md`
2. **常に効いてほしいか？**
   - 常に効いてほしいなら `AGENTS.md` / `instructions`
   - 呼び出したときだけでよいなら `agents` / `skills`
3. **役割は対話ルールか、実行支援か？**
   - 対話ルールなら `AGENTS.md` / `instructions`
   - 実行支援なら `skills` / `workflows`
4. **Cloud Agent の準備が必要か？**
   - 必要なら `workflows`
5. **本体に入れるべきか、差し込みにすべきか？**
   - どのプロジェクトでも共通なら Core
   - プロジェクト固有なら Blueprints 経由で差し込み
   - 強い前提を持つなら Optional Packs

## GitHub Copilot 関連ファイルの解説ファイルリンク

- [ABOUT_AGENTS.md](./ABOUT_AGENTS.md)
- [ABOUT_COPILOT_INSTRUCTIONS.md](./ABOUT_COPILOT_INSTRUCTIONS.md)
- [ABOUT_INSTRUCTIONS.md](./ABOUT_INSTRUCTIONS.md)
- [ABOUT_ROOT_AGENTS.md](./ABOUT_ROOT_AGENTS.md)
- [ABOUT_SKILLS.md](./ABOUT_SKILLS.md)
- [ABOUT_WORKFLOWS.md](./ABOUT_WORKFLOWS.md)