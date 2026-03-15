# Start Here（初学者向け：2〜4週間でMVPを出す一本道）

このテンプレは「迷いを減らして最短で検証する」ための型です。
まずは **コア体験を1つ**に絞って、2〜4週間で出すことを優先します。

このページは「何をどの順で埋めればいいか」を1本にまとめています。
迷ったらここに戻ってください。

## ドキュメントの使い方（いつ/何を書くか）

| ファイル                                                                                     | いつ使う            | 何をする（最低限）                                                |
| -------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------- |
| [PRD_TEMPLATE.md](PRD_TEMPLATE.md)                                                           | Day 1               | MVP（Must/Won’t）・KPI・Kill criteria を1枚で確定                 |
| [architecture.md](architecture.md)                                                           | Day 1〜2            | 画面/データ/主要リスクだけ決めてADRに残す                         |
| [TECH_STACK_DECISION.md](TECH_STACK_DECISION.md)                                             | 迷ったとき          | 技術選定を止めずに決める（枯れたデフォルト）                      |
| [MVP_BACKLOG_TEMPLATE.md](MVP_BACKLOG_TEMPLATE.md)                                           | Day 2               | PRDのMustを 10〜20 Issue に分割（1 Issue=半日以内）               |
| [ANALYTICS_SPEC_TEMPLATE.md](ANALYTICS_SPEC_TEMPLATE.md)                                     | Day 2               | `signup/activation/purchase` のイベント名・プロパティ・KPI を定義 |
| [development.md](development.md)                                                             | Week 1〜            | Done定義/ブランチ/環境変数など、日々の開発ルールを揃える          |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)                                                   | Week 2〜3           | 本番への出し方・環境変数・ロールバック方針を決める                |
| [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)                                                   | Week 2〜3           | ローンチ前の抜け漏れを潰す（法務/計測/運用/マーケ）               |
| [RUNBOOK_TEMPLATE.md](RUNBOOK_TEMPLATE.md)                                                   | Week 2〜3           | 障害時の手順・告知・バックアップ/復旧・削除依頼対応を決める       |
| [SEO_GTM_CHECKLIST.md](SEO_GTM_CHECKLIST.md)                                                 | Week 3〜            | UTM/OGP/SEO の最低限を整える（やりすぎ防止）                      |
| [GROWTH_PLAYBOOK.md](GROWTH_PLAYBOOK.md)                                                     | Week 3〜4           | 7日分の投稿計画 + 週3本の改善実験を作る                           |
| [CUSTOMER_SUPPORT_PLAYBOOK.md](CUSTOMER_SUPPORT_PLAYBOOK.md)                                 | ローンチ前          | 1人で回る問い合わせ運用（分類/SLA/返信テンプレ）                  |
| [POSTMORTEM_TEMPLATE.md](POSTMORTEM_TEMPLATE.md)                                             | 障害後              | 原因/対応/再発防止を最大3つに絞って残す                           |
| [../.env.example](../.env.example)                                                           | いつでも            | 環境変数の雛形（`.env`はコミットしない）                          |
| [../CHANGELOG.md](../CHANGELOG.md)                                                           | マージ時/リリース時 | `Unreleased` に1行追記、リリース時に節へ移動                      |
| [../SUPPORT.md](../SUPPORT.md)                                                               | ローンチ前          | 問い合わせ窓口の入口を用意                                        |
| [../SECURITY.md](../SECURITY.md)                                                             | ローンチ前          | 脆弱性報告の窓口を用意                                            |
| [../.github/ISSUE_TEMPLATE/feature_request.md](../.github/ISSUE_TEMPLATE/feature_request.md) | いつでも            | 機能要望/新規機能のIssueを作る                                    |
| [../.github/ISSUE_TEMPLATE/bug_report.md](../.github/ISSUE_TEMPLATE/bug_report.md)           | いつでも            | バグの再現/期待結果/影響を揃える                                  |
| [../.github/ISSUE_TEMPLATE/experiment.md](../.github/ISSUE_TEMPLATE/experiment.md)           | 成長期              | 改善実験（仮説→変更→計測→ロールバック）                           |
| [../.github/ISSUE_TEMPLATE/incident.md](../.github/ISSUE_TEMPLATE/incident.md)               | 障害時              | 影響/暫定/恒久/ふりかえり をIssueで管理                           |
| [../.github/pull_request_template.md](../.github/pull_request_template.md)                   | PR作成時            | 変更内容/確認手順/影響範囲を書いて漏れを防ぐ                      |

## 0) 今日やること（60〜120分）

このフェーズの目的: 「今日やること」を決めて、明日から実装に入れる状態を作ります。

このフェーズで使うドキュメント（最低限）:

- [docs/PRD_TEMPLATE.md](PRD_TEMPLATE.md): Must/Won’t/KPI/Kill criteria まで埋める
- [docs/architecture.md](architecture.md): 画面/データ/主要リスクだけ決めてADR 0001として残す
- [docs/MVP_BACKLOG_TEMPLATE.md](MVP_BACKLOG_TEMPLATE.md): Mustを10〜20 Issueに分割（1 Issue=半日以内）

迷ったとき（止まりやすい所を先に潰す）:

- 技術選定が止まる: [docs/TECH_STACK_DECISION.md](TECH_STACK_DECISION.md) を「推奨デフォルト」で一旦決める
- 計測が曖昧: [docs/ANALYTICS_SPEC_TEMPLATE.md](ANALYTICS_SPEC_TEMPLATE.md) に `signup/activation/purchase` だけ先に定義
- 環境変数が不安: [../.env.example](../.env.example) を埋めて「何が必要か」を見える化

1. [docs/PRD_TEMPLATE.md](PRD_TEMPLATE.md) を埋める（MVP / Won’t / KPI / Kill criteria まで）
2. [docs/architecture.md](architecture.md) に「最小設計」を1つだけ残す（ADR 0001）
3. [docs/MVP_BACKLOG_TEMPLATE.md](MVP_BACKLOG_TEMPLATE.md) を見ながら Issue を10〜20個に切る

迷ったら（任意）:

- 技術選定が止まる: [docs/TECH_STACK_DECISION.md](TECH_STACK_DECISION.md)
- 本番に出す前提を固めたい: [docs/DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

> 迷ったら「やらないこと（Won’t）」を増やしてください。

---

## 1) 企画（Day 1）

編集: [docs/PRD_TEMPLATE.md](PRD_TEMPLATE.md)

このフェーズでやること（最低限）:

- Must（やる）: 3〜7個
- Won’t（やらない）: できるだけ増やす
- KPI: 2週間で測れるもの（例: activation率）
- Kill criteria: 「続けない条件」を先に決める

完了条件（AC）

- [ ] コア体験が1文で言える
- [ ] MVP機能（Must）が3〜7個に収まっている
- [ ] Kill criteria（失敗判定）が明文化されている
- [ ] KPIが2週間で測れる形になっている

---

## 2) 設計（Day 1〜2）

編集: [docs/architecture.md](architecture.md)

このフェーズでやること（最低限）:

- 画面（ページ）一覧: MVPに必要な分だけ
- データモデル: 最小（後から増やせる形）
- リスクと回避策: 規約/個人情報/課金/依存の4つだけでもOK

迷ったら:

- 技術選定: [docs/TECH_STACK_DECISION.md](TECH_STACK_DECISION.md) の「まず決める」を埋めて、ADRに転記

完了条件（AC）

- [ ] 画面（ページ）一覧がある
- [ ] データ（テーブル/ドキュメント）の最小モデルがある
- [ ] リスク（規約/個人情報/支払い/依存）と回避策が1行ずつある

---

## 3) 計測設計（Day 2）

編集: [docs/ANALYTICS_SPEC_TEMPLATE.md](ANALYTICS_SPEC_TEMPLATE.md)

このフェーズでやること（最低限）:

- イベントは3つに絞る: `signup` / `activation` / `purchase`（課金するなら）
- 各イベントの「いつ発火するか」を1行で書く
- KPIを式で書ける状態にする（例: activation率）

最低限、次だけ定義してください。

- signup（登録）
- activation（初回成功体験）
- purchase（課金するなら）

KPI例:

- アクティベーション率 = activation / signup

補助:

- 配布/UTM/OGPの最低限: [docs/SEO_GTM_CHECKLIST.md](SEO_GTM_CHECKLIST.md)

GTMも最低限だけ決める（任意だけどおすすめ）:

- UTM命名（source/medium/campaign）だけ決める（[docs/SEO_GTM_CHECKLIST.md](SEO_GTM_CHECKLIST.md)）

---

## 4) 実装（Week 1〜2）

運用: GitHub Issues + PR（[.github/pull_request_template.md](../.github/pull_request_template.md)）

このフェーズで使うドキュメント（運用の軸）:

- [docs/development.md](development.md): Done定義・ブランチ運用・環境変数の扱いを守る
- [../CHANGELOG.md](../CHANGELOG.md): PRマージのたびに `Unreleased` に1行追記（ユーザー影響だけ）
- [../.env.example](../.env.example): 必要な環境変数が増えたらここも更新

ルール

- 1 Issue = 1 PR
- PRは「半日以内に終わる粒度」に切る
- 重要導線（登録→初回成功体験→課金）以外は後回し

使うテンプレ:

- PRテンプレ: [../.github/pull_request_template.md](../.github/pull_request_template.md)
- バグ: [../.github/ISSUE_TEMPLATE/bug_report.md](../.github/ISSUE_TEMPLATE/bug_report.md)
- 機能: [../.github/ISSUE_TEMPLATE/feature_request.md](../.github/ISSUE_TEMPLATE/feature_request.md)

詰まったら:

- 「Issueが大きい」: [docs/MVP_BACKLOG_TEMPLATE.md](MVP_BACKLOG_TEMPLATE.md) に戻って分割し直す

---

## 5) ローンチ準備（Week 2〜3）

編集: [docs/LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) / [docs/RUNBOOK_TEMPLATE.md](RUNBOOK_TEMPLATE.md)

このフェーズでやること（最低限）:

- [docs/LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md): 法務/計測/運用/マーケの抜け漏れを潰す
- [docs/RUNBOOK_TEMPLATE.md](RUNBOOK_TEMPLATE.md): 障害時の手順、告知、ロールバック、バックアップ/復旧、削除依頼対応を埋める
- [docs/DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md): 本番への出し方とロールバック方針を文章にする
- [docs/CUSTOMER_SUPPORT_PLAYBOOK.md](CUSTOMER_SUPPORT_PLAYBOOK.md): 問い合わせの分類/SLA/返信テンプレを決める

補助（ローンチ前に埋める）:

- 問い合わせ窓口（入口）: [../SUPPORT.md](../SUPPORT.md)
- 脆弱性窓口: [../SECURITY.md](../SECURITY.md)
- 環境変数の雛形: [../.env.example](../.env.example)
- 変更履歴（リリース時に更新）: [../CHANGELOG.md](../CHANGELOG.md)

完了条件（AC）

- [ ] 問い合わせ導線がある（[SUPPORT.md](../SUPPORT.md)）
- [ ] 規約・プライバシー方針が用意できる（文面は別途）
- [ ] ロールバック手順が箇条書きである

---

## 6) マーケ/改善（Week 3〜4）

編集: [docs/GROWTH_PLAYBOOK.md](GROWTH_PLAYBOOK.md)

このフェーズでやること（最低限）:

- [docs/GROWTH_PLAYBOOK.md](GROWTH_PLAYBOOK.md): 7日分の投稿計画 + 実験3本を作る
- [docs/SEO_GTM_CHECKLIST.md](SEO_GTM_CHECKLIST.md): OGP/UTMなど「最低限」を満たして配布効率を上げる
- [docs/ANALYTICS_SPEC_TEMPLATE.md](ANALYTICS_SPEC_TEMPLATE.md): 実験の成功条件に紐づくイベント/KPIを確認

改善実験はIssueで管理すると回しやすいです:

- 実験テンプレ: [../.github/ISSUE_TEMPLATE/experiment.md](../.github/ISSUE_TEMPLATE/experiment.md)

障害が起きたら（運用の回し方）:

- 障害Issue: [../.github/ISSUE_TEMPLATE/incident.md](../.github/ISSUE_TEMPLATE/incident.md)
- ふりかえり: [docs/POSTMORTEM_TEMPLATE.md](POSTMORTEM_TEMPLATE.md)

完了条件（AC）

- [ ] 7日分の投稿計画がある
- [ ] 改善実験が週3本のペースで回せる（仮説→実施→計測→学び）
