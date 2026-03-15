# Web-AI-Coding-Template

## このリポジトリの目的

このリポジトリは、GitHub Copilot と一緒に「スモールビジネス向けの小さなプロダクト」を立ち上げるためのテンプレートです。
開発未経験でも迷いにくいように、企画→設計→実装→運用までの“型”（ドキュメント、チェックリスト、Issue/PRテンプレ）を揃えています。

このテンプレでできること:

- まずPRD（1枚）で「MVP」と「収益化」と「KPI」を確定する
- 設計を最小限に決めて、Issueに分割して、1Issue=1PRで進める
- ローンチ前の抜け漏れ（規約、問い合わせ導線、計測など）をチェックリストで防ぐ

まずはここから:

- [docs/00_START_HERE.md](docs/00_START_HERE.md)

補助（迷ったら）:

- 技術選定: [docs/TECH_STACK_DECISION.md](docs/TECH_STACK_DECISION.md)
- デプロイ: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
- SEO/GTM: [docs/SEO_GTM_CHECKLIST.md](docs/SEO_GTM_CHECKLIST.md)
- 問い合わせ運用: [docs/CUSTOMER_SUPPORT_PLAYBOOK.md](docs/CUSTOMER_SUPPORT_PLAYBOOK.md)
- 障害ふりかえり: [docs/POSTMORTEM_TEMPLATE.md](docs/POSTMORTEM_TEMPLATE.md)

各ドキュメントの「いつ使うか / 何を書くか（最低限）」は、[docs/00_START_HERE.md](docs/00_START_HERE.md) の「ドキュメントの使い方」表にまとめています。

## リポジトリのファイル構成と各ファイルの役割

### 全体構成

```text
.
├─ README.md
├─ CHANGELOG.md
├─ CONTRIBUTING.md
├─ CODE_OF_CONDUCT.md
├─ SECURITY.md
├─ SUPPORT.md
├─ .env.example
├─ .editorconfig
├─ .gitignore
├─ .vscode/
│  ├─ settings.json
│  └─ extensions.json
├─ .github/
│  ├─ copilot-instructions.md
│  ├─ pull_request_template.md
│  └─ ISSUE_TEMPLATE/
│     ├─ bug_report.md
│     ├─ experiment.md
│     ├─ incident.md
│     └─ feature_request.md
└─ docs/
   ├─ 00_START_HERE.md
   ├─ PRD_TEMPLATE.md
   ├─ MVP_BACKLOG_TEMPLATE.md
   ├─ LAUNCH_CHECKLIST.md
   ├─ ANALYTICS_SPEC_TEMPLATE.md
   ├─ RUNBOOK_TEMPLATE.md
   ├─ GROWTH_PLAYBOOK.md
   ├─ TECH_STACK_DECISION.md
   ├─ DEPLOYMENT_GUIDE.md
   ├─ SEO_GTM_CHECKLIST.md
   ├─ CUSTOMER_SUPPORT_PLAYBOOK.md
   ├─ POSTMORTEM_TEMPLATE.md
   ├─ development.md
   ├─ architecture.md
   └─ ai-guidelines.md
```

### 各ファイルの役割（簡潔）

#### docs/（企画〜運用の“材料”）

- [docs/00_START_HERE.md](docs/00_START_HERE.md): 初学者向けの一本道（最初に読む）
- [docs/PRD_TEMPLATE.md](docs/PRD_TEMPLATE.md): 1枚PRD（MVP/マネタイズ/KPI/検証）
- [docs/architecture.md](docs/architecture.md): 最小設計の決定メモ（DB/画面/API/リスク）
- [docs/MVP_BACKLOG_TEMPLATE.md](docs/MVP_BACKLOG_TEMPLATE.md): PRD→Issue分割の型
- [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md): ローンチ前チェック（規約/計測/運用）
- [docs/ANALYTICS_SPEC_TEMPLATE.md](docs/ANALYTICS_SPEC_TEMPLATE.md): 計測仕様（イベント/プロパティ/KPI）
- [docs/RUNBOOK_TEMPLATE.md](docs/RUNBOOK_TEMPLATE.md): 運用手順（障害対応/ロールバック/問い合わせ）
- [docs/GROWTH_PLAYBOOK.md](docs/GROWTH_PLAYBOOK.md): 集客/改善を週次で回す型
- [docs/TECH_STACK_DECISION.md](docs/TECH_STACK_DECISION.md): 技術選定（迷ったらのデフォルト）
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md): デプロイ/環境変数/ロールバック
- [docs/SEO_GTM_CHECKLIST.md](docs/SEO_GTM_CHECKLIST.md): SEO/配布導線（最低限）
- [docs/CUSTOMER_SUPPORT_PLAYBOOK.md](docs/CUSTOMER_SUPPORT_PLAYBOOK.md): 問い合わせ運用の型
- [docs/POSTMORTEM_TEMPLATE.md](docs/POSTMORTEM_TEMPLATE.md): 障害ふりかえり（再発防止）
- [docs/development.md](docs/development.md): 開発の進め方（派生リポジトリで具体化）
- [docs/ai-guidelines.md](docs/ai-guidelines.md): AIに渡す情報のコツ

#### .github/（CopilotとGitHub運用の型）

- [.github/copilot-instructions.md](.github/copilot-instructions.md): Copilotの出力形式/制約/優先度
- [.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/): Issueテンプレ（バグ/機能/実験/障害）
- [.github/pull_request_template.md](.github/pull_request_template.md): PRテンプレ（確認漏れを減らす）

#### 直下のポリシー/案内

- [SECURITY.md](SECURITY.md): 脆弱性報告の窓口
- [SUPPORT.md](SUPPORT.md): 問い合わせ導線（運用先）
- [CONTRIBUTING.md](CONTRIBUTING.md): Issue/PRの運用ルール
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md): 行動規範
- [.env.example](.env.example): 環境変数の雛形（秘密情報はコミットしない）
- [CHANGELOG.md](CHANGELOG.md): 変更履歴（最小フォーマット）
  - いつ書く: PRをマージするたびに `Unreleased` に1行追記
  - 何を書く: ユーザー影響のある変更だけ（1変更=1行、長文にしない）
  - リリース時: `Unreleased` の箇条書きを新しいバージョン節（例: `0.1.1`）に移して、`Unreleased` を空に戻す

#### 開発環境の統一（基本は触らない）

- [.editorconfig](.editorconfig): 改行/末尾改行/空白などの共通ルール
- [.vscode/settings.json](.vscode/settings.json): VS Codeの動作設定（保存時フォーマット等）
- [.vscode/extensions.json](.vscode/extensions.json): おすすめ拡張（提案のみ）
- [.gitignore](.gitignore): Git管理しないファイル

## 開発フロー（AIとの対話と編集箇所）

このテンプレは、フェーズごとに「編集するもの」と「AIへの依頼の型」が決まるようにしています。

### ざっくり全体像（7フェーズ）

1. Kickoff（PM）: PRD（製品要求仕様書）を1枚にする
2. 設計（Tech Lead）: DB/画面/API/リスクを最小限決める
3. Issue化（PM/Tech Lead）: MVPを10〜20 Issueに分割する
4. 実装（Dev）: 1 Issue = 1 PR で進める（Copilot Edits）
5. QA（QA）: クリティカル導線だけ最小テスト
6. ローンチ（Ops）: 計測/ログ/問い合わせ導線/規約
7. 成長（Growth）: 投稿カレンダー＆改善実験（週次）

### AI依頼テンプレ（毎回これを入れるとブレにくい）

```text
ロール: （PM / Tech Lead / Dev / QA / Ops / Growth）
目的: （今このフェーズで決めたい/作りたいこと）
前提: （ターゲット、期限、優先度、やらないこと、既存の決定事項）
入力: （PRD/設計メモ/Issueリンク/該当ファイルなど）
出力形式: （表/チェックリスト/Issue粒度/完了条件）
```

---

### 1) Kickoff（PMロール）：1枚PRDを作る（1〜2時間）

- 編集するファイル: [docs/PRD_TEMPLATE.md](docs/PRD_TEMPLATE.md)
- ゴール: MVP/Won't/KPI/マネタイズ/検証（Kill criteria）を1枚で確定
- AIとの進め方: 「3案→1案に決定→PRD完成」の順で収束させる

依頼例:

```text
ロール: PM
目的: docs/PRD_TEMPLATE.md を埋めてMVPを確定したい
前提: ToC、ターゲットは若者、2週間でMVP、収益化を最優先
出力形式: 3案の比較表→推奨案（理由）→推奨案のPRD完成版
```

### 2) 設計（Tech Leadロール）：DB/画面/API/リスクを決める（半日）

- 編集するファイル: [docs/architecture.md](docs/architecture.md)
- ゴール: 実装が始められる最小の設計を決める（完璧にしない）
- AIとの進め方: 迷う点は「選択肢 / 推奨 / 理由 / 後で変更する方法」をセットで出させる

依頼例:

```text
ロール: Tech Lead
目的: PRDを前提にMVPの最小設計を決めたい
入力: PRD
出力形式: DB/画面/API/主要リスクと対策（決定事項/理由/代替案/影響 の順）
```

### 3) Issue化（PM/Tech Lead）：MVPを10〜20 Issueに分割（1時間）

- 編集するもの: GitHub Issues（[.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/) を使用）
- ゴール: 1 Issueが「1〜3時間〜半日」で終わる粒度に切る
- AIとの進め方: 各Issueに受け入れ条件（AC）を1〜3個つける
- 補助テンプレ: [docs/MVP_BACKLOG_TEMPLATE.md](docs/MVP_BACKLOG_TEMPLATE.md)

依頼例:

```text
ロール: PM/Tech Lead
目的: MVPを10〜20 Issueに分割したい
入力: PRD、設計メモ
出力形式: Issue一覧（タイトル/目的/AC(1〜3)/優先度/依存関係/推定(S/M/L)）
```

### 4) 実装（Dev）：1 Issue = 1 PR（Copilot Edits多用）

- 編集するもの: 実装コード（派生リポジトリ側）、PR作成時に [.github/pull_request_template.md](.github/pull_request_template.md)
- ゴール: 小さく変更して小さくマージする（レビューと巻き戻しを楽にする）
- AIとの進め方: 「差分計画→実装→テスト/確認」を分割して依頼する

依頼例:

```text
ロール: Dev
目的: Issue #X を実装したい
出力形式: 変更ファイル一覧→差分方針→実装→最小テスト→手動確認手順
```

### 5) QA（QAロール）：クリティカル導線だけテスト（最小）

- 編集するもの: （プロダクト側の）テストコード or 手動テスト手順、[docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md)
- ゴール: 重要導線（登録→初回成功体験→課金）だけ守る
- AIとの進め方: テスト対象を絞り、期待結果を短く明文化する

依頼例:

```text
ロール: QA
目的: MVPのクリティカル導線だけテストしたい
前提: 優先は 認証/課金/データ保存/エラー時の挙動
出力形式: 最小テスト計画（手動/自動のどちらでも可）
```

### 6) ローンチ（Ops）：計測/ログ/問い合わせ導線/規約

- 編集するファイル: [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md)、[docs/ANALYTICS_SPEC_TEMPLATE.md](docs/ANALYTICS_SPEC_TEMPLATE.md)、[docs/RUNBOOK_TEMPLATE.md](docs/RUNBOOK_TEMPLATE.md)、[SECURITY.md](SECURITY.md)、[SUPPORT.md](SUPPORT.md)
- ゴール: 「出していい状態」を確認し、当日の手順をチェックリスト化する
- AIとの進め方: スモークテストとロールバックを短く書かせる

依頼例:

```text
ロール: Ops
目的: ローンチ当日の手順を固めたい
入力: LAUNCH_CHECKLIST
出力形式: スモークテスト手順 + ロールバック手順（箇条書き）
```

### 7) 成長（Growth）：投稿カレンダー＆改善実験（週次）

- 編集するもの: [docs/GROWTH_PLAYBOOK.md](docs/GROWTH_PLAYBOOK.md)
- ゴール: 1週間単位で「投稿」と「小さな実験」を回す
- AIとの進め方: Askで案出し→Planで1週間分に確定→実施して数字を見る

依頼例:

```text
ロール: Growth
目的: 1週間の集客と改善を回したい
前提: ターゲットは若者
出力形式: 投稿カレンダー（7日分）+ 改善実験3つ（仮説/実施/計測/成功条件）
```
