# 〆トラ LP実装仕様

このファイルは、LP実装に必要な情報だけを残した実装用の整理版です。

## 1. 実装の目的

- [src/app/page.tsx](src/app/page.tsx) を、新コンセプト検証用LPの入口として置き換える。
- 目的は販売ではなく、先行登録導線の検証。
- モバイル/PCの両方で読みやすく、CTA到達率を落とさない構成を優先する。
- デザインは [docs/DESIGN.md](docs/DESIGN.md) に準拠する。

## 2. 想定ターゲット

- 就活初期〜中期の大学3年生・修士1年生
- 就活を進めているが、自分が本当にやりたいことがまだ曖昧な学生
- 情報収集はしているが、企業選びと次の行動に納得感が持てていない学生

## 3. 採用するLP文面

### HeroSection

- 見出し: 就活しているのに、やりたいことがわからない人へ。
- サブコピー: 価値観や興味を整理しながら、あなたに合いそうな企業候補と次の一手を提案する就活支援です。
- CTA: 先行利用に登録する
- 補助文: 現在は先行案内・検証段階です。

### ProblemSection

- 見出し: こんな状態で、就活が止まっていませんか？
- 課題:
  - 自己分析をしても、どの企業を見ればいいかわからない
  - 情報が多すぎて、逆に決められない
  - 行動しても、次に何をするか整理されない

### HowItWorksSection

- 見出し: 〆トラは、発見から次の一手までをつなぎます。
- ステップ:
  1. やりたいことのヒントを整理する
  2. 合いそうな企業候補と次の一手が見える
  3. 振り返るたびに、次の提案が自分向けに近づく

### BenefitSection

- 見出し: 使うと、就活の進み方が変わります。
- ベネフィット:
  - 次にやることが見える
  - 企業候補が理由つきでわかる
  - 行動するほど、自分に合う方向が見えてくる

### DifferenceSection

- 見出し: 情報を増やすだけでなく、行動につなげるために。
- 本文: 就活サイトは情報収集に、汎用AIは相談に向いています。
- 価値ループ: 発見 → 行動 → 振り返り → 再提案

### BetaCtaSection

- 見出し: まずは、先行案内に登録してください。
- 本文: 先行登録いただいた方に、ベータ版やヒアリングの案内を順次お送りします。
- CTA: 先行利用に登録する
- 補助文: 登録は無料です。就活中の悩みがある方を優先してご案内します。

### LeadCaptureComplete

- 見出し: 登録ありがとうございます
- 本文: 〆トラは現在、先行案内・検証段階です。今後、ベータ版やヒアリングのご案内を順次お送りします。
- 補助文: 就活の悩みがあれば、フォーム自由記述の内容を参考に改善へ活用します。

## 4. UIブロック一覧

| UI名                | 役割                         | 主な要素                        | 主CTA                  |
| ------------------- | ---------------------------- | ------------------------------- | ---------------------- |
| HeroSection         | 誰向けの価値かを最初に伝える | 見出し、サブコピー、CTA、補助文 | 先行利用に登録する     |
| ProblemSection      | 課題共感を作る               | 見出し、課題リスト              | なし                   |
| HowItWorksSection   | 価値の流れを短く示す         | 見出し、3ステップ               | なし                   |
| BenefitSection      | 利用後の変化を具体化する     | 見出し、ベネフィット3点         | なし                   |
| DifferenceSection   | 既存手段との違いを整理する   | 見出し、比較説明、価値ループ    | なし                   |
| BetaCtaSection      | 登録導線を再提示する         | 見出し、本文、CTA、補助文       | 先行利用に登録する     |
| LeadCaptureDialog   | 先行登録モーダルを表示する   | フォーム、補助文、エラー表示    | 登録して案内を受け取る |
| LeadCaptureComplete | 登録完了後に期待値調整する   | 完了メッセージ、今後の案内      | なし                   |

## 5. 画面ワイヤーフレーム

#### 画面1: LP本体

```text
+--------------------------------------------------------------+
| HeroSection                                                  |
| 就活しているのに、やりたいことがわからない人へ。           |
| 価値観や興味を整理しながら、企業候補と次の一手を提案       |
| [先行利用に登録する]                                         |
| 現在は先行案内・検証段階です。                               |
+--------------------------------------------------------------+
| ProblemSection                                               |
| こんな状態で、就活が止まっていませんか？                     |
| - どの企業を見ればいいかわからない                           |
| - 情報が多すぎて決められない                                 |
| - 次に何をするか整理されない                                 |
+--------------------------------------------------------------+
| HowItWorksSection                                            |
| 1. やりたいことのヒントを整理                                |
| 2. 企業候補と次の一手が見える                                |
| 3. 振り返るたびに提案が自分向けに近づく                      |
+--------------------------------------------------------------+
| BenefitSection                                               |
| - 次にやることが見える                                       |
| - 企業候補が理由つきでわかる                                 |
| - 行動するほど方向が見えてくる                               |
+--------------------------------------------------------------+
| DifferenceSection                                            |
| 就活サイト = 情報収集 / 汎用AI = 相談                        |
| 〆トラ = 発見 -> 行動 -> 振り返り -> 再提案                  |
+--------------------------------------------------------------+
| BetaCtaSection                                               |
| まずは、先行案内に登録してください。                         |
| [先行利用に登録する]                                         |
| 登録は無料です。                                             |
+--------------------------------------------------------------+
```

注釈:

- 1画面完結のLPとして、ファーストビューと最下部CTAで登録機会を2回作る。
- 中央は「課題 → 仕組み → 変化 → 差分」の順で抵抗感を下げる。

#### 画面2: 登録フォームモーダル

```text
+----------------------------------------------+
| 登録して案内を受け取る                        |
| 正式公開前の先行案内です                      |
|                                              |
| メールアドレス *                              |
| [____________________________]               |
|                                              |
| 卒業年度 *                                    |
| [ 2027 ▼ ]                                   |
|                                              |
| 今の悩み（任意）                              |
| [____________________________]               |
| [____________________________]               |
|                                              |
| ヒアリング参加可否（任意）                    |
| ( ) はい  ( ) いいえ                          |
|                                              |
| [登録して案内を受け取る]                      |
| 無料です / 後日ご案内します                   |
+----------------------------------------------+
| エラー: メールアドレスを入力してください      |
+----------------------------------------------+
```

注釈:

- 入力項目は最小限に絞り、熱量計測に必要な情報だけ取る。
- エラーは入力欄直下に短く表示し、送信失敗も同位置で扱う。

#### 画面3: 登録完了状態

```text
+--------------------------------------------------+
| 登録ありがとうございます                        |
|                                                  |
| 〆トラは現在、先行案内・検証段階です。           |
| 今後、ベータ版やヒアリングのご案内を             |
| 順次お送りします。                                |
|                                                  |
| 就活の悩みは、入力内容を参考に改善へ活用します。 |
|                                                  |
| [LPに戻る]                                       |
+--------------------------------------------------+
```

注釈:

- 「すぐ使える誤認」を防ぎつつ、待機理由を明確にする。
- 必要なら後からヒアリング日程調整導線を追加する。

## 6. コンポーネント設計

### 実装方針

- 静的な説明セクションは Server Component に寄せる。
- モーダル表示、フォーム入力、送信状態だけを Client Component に切り出す。
- レイアウトは mobile first で組み、`md` と `lg` で横幅・段組みだけを拡張する。
- 先行登録APIは別実装に分け、LP本体は表示とCTA導線に責務を絞る。

### 想定ファイル構成

| ファイル                                        | 役割                                                  |
| ----------------------------------------------- | ----------------------------------------------------- |
| [src/app/page.tsx](src/app/page.tsx)            | LP全体のエントリ。`metadata` とセクション配置を持つ   |
| src/app/\_components/lp/LandingPage.tsx         | LP全体のレイアウトを束ねる Server Component           |
| src/app/\_components/lp/HeroSection.tsx         | ヒーロー表示                                          |
| src/app/\_components/lp/ProblemSection.tsx      | 共感課題表示                                          |
| src/app/\_components/lp/HowItWorksSection.tsx   | 3ステップ表示                                         |
| src/app/\_components/lp/BenefitSection.tsx      | ベネフィット表示                                      |
| src/app/\_components/lp/DifferenceSection.tsx   | 既存手段との差分表示                                  |
| src/app/\_components/lp/BetaCtaSection.tsx      | 下部CTA表示                                           |
| src/app/\_components/lp/LeadCaptureDialog.tsx   | 登録モーダル本体を持つ Client Component               |
| src/app/\_components/lp/LeadCaptureForm.tsx     | 入力・バリデーション・送信処理を持つ Client Component |
| src/app/\_components/lp/LeadCaptureComplete.tsx | 完了状態表示                                          |
| src/app/\_components/lp/content.ts              | LP文言、リスト、ステップ定義                          |

### コンポーネントツリー

```text
HomePage (Server)
└─ LandingPage (Server)
   ├─ HeaderBar (Server)
   ├─ HeroSection (Server)
   │  └─ LeadCaptureDialogTrigger (Client)
   ├─ ProblemSection (Server)
   ├─ HowItWorksSection (Server)
   ├─ BenefitSection (Server)
   ├─ DifferenceSection (Server)
   ├─ BetaCtaSection (Server)
   │  └─ LeadCaptureDialogTrigger (Client)
   └─ FooterNote (Server)

LeadCaptureDialog (Client)
├─ LeadCaptureForm (Client)
└─ LeadCaptureComplete (Client)
```

### 各コンポーネントの責務

#### `HomePage`

- 種別: Server Component
- 役割:
  - ページのメタ情報設定
  - `LandingPage` を返すだけの薄い入口にする

#### `LandingPage`

- 種別: Server Component
- 役割:
  - LP全体のセクション順を管理
  - 共通コンテナ幅、背景色、余白ルールを統一

#### `HeroSection`

- 種別: Server Component
- 役割:
  - 第一CTAまでをファーストビュー内に収める
  - 見出し、サブコピー、補助文を表示

#### `ProblemSection`

- 種別: Server Component
- 役割: 3つの課題項目で共感を作る

#### `HowItWorksSection`

- 種別: Server Component
- 役割: 価値の流れを3ステップで見せる

#### `BenefitSection`

- 種別: Server Component
- 役割: 利用後の変化を短く再提示する

#### `DifferenceSection`

- 種別: Server Component
- 役割: 既存手段との違いを整理する

#### `BetaCtaSection`

- 種別: Server Component
- 役割: ページ下部で再度登録機会を作る

#### `LeadCaptureDialog`

- 種別: Client Component
- 役割:
  - 開閉状態の管理
  - フォームと完了状態の切り替え
- state:
  - `open: boolean`
  - `submitted: boolean`
  - `pending: boolean`
  - `error: string | null`

#### `LeadCaptureForm`

- 種別: Client Component
- 役割:
  - 入力制御
  - 必須チェック
  - API送信
  - 成功時に完了状態へ遷移
- 入力項目:
  - メールアドレス
  - 卒業年度
  - 今の悩み
  - ヒアリング参加可否

#### `LeadCaptureComplete`

- 種別: Client Component
- 役割:
  - 完了メッセージ表示
  - LPへ戻る導線表示

## 7. レスポンシブ/スタイル方針

### レスポンシブ設計ルール

| 項目             | mobile                           | tablet / desktop           |
| ---------------- | -------------------------------- | -------------------------- |
| 横余白           | `px-4`                           | `sm:px-6 lg:px-8`          |
| 最大幅           | `max-w-screen-sm` を超えない体感 | `max-w-5xl` 〜 `max-w-6xl` |
| ヒーロー見出し   | 2〜3行許容                       | 2行以内を目安              |
| CTAボタン        | 幅100%優先                       | 自動幅 + 最低横幅確保      |
| カードレイアウト | 1カラム                          | 2〜3カラム                 |
| モーダル         | 下部シート風                     | 中央ダイアログ             |
| 比較セクション   | 縦積み                           | 2カラム                    |

補足:

- 先に mobile を基準に高さとCTA位置を決め、PCでは横幅だけ広げる。
- PCで要素を増やすより、空白で読みやすくする方向を優先する。

### Tailwind クラス方針

- ページ外枠: `min-h-screen bg-white text-slate-900`
- セクション共通: `mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8`
- セクション見出し: `text-2xl font-bold tracking-tight sm:text-3xl`
- 本文: `text-sm leading-7 text-slate-600 sm:text-base`
- 主CTA: `inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700`
- 補助情報: `text-sm text-slate-500`
- カード: `rounded-2xl border border-slate-200 bg-white p-6 shadow-sm`

## 8. フォーム/API/計測

### 計測ツール方針

- LP分析は `GA4 + GTM + Microsoft Clarity` を採用する。
- 役割分担:
  - GA4: 流入、CV、主要イベント計測
  - GTM: タグ管理と計測追加の運用
  - Microsoft Clarity: ヒートマップとセッションリプレイ確認
- 初期段階では、この3つをLP検証の標準構成とする。

### 入力項目

- メールアドレス（必須）
- 卒業年度（必須）
- 今の悩み（任意）
- ヒアリング参加可否（任意 / Yes・No）

### データ/状態の流れ

1. ユーザーが `HeroSection` または `BetaCtaSection` のCTAを押す
2. `LeadCaptureDialog` が開く
3. `LeadCaptureForm` が入力を受ける
4. 送信APIへPOSTする
5. 成功なら `LeadCaptureComplete` を表示する
6. 失敗ならフォーム下に短いエラーを表示する

### API設計の受け皿

- 登録送信先は `POST /api/waitlist` 相当を新設する想定にする。
- APIで扱う責務:
  - メールアドレス等の保存
  - 重複登録の扱い
  - 必要なら通知送信
- APIで分ける責務:
  - 計測イベント送信はメールアドレスを含めず別処理にする

### 計測イベント

- GTM 経由で GA4 / Clarity を設定する場合も、イベント名と発火条件はこのドキュメントを正とする。

- `lp_viewed`
- `lp_primary_cta_clicked`
- `lp_secondary_cta_clicked`
- `lp_waitlist_submitted`
- `lp_waitlist_submit_failed`

### GA4 / GTM イベント設計表

| イベント名                  | 目的                          | 発火タイミング                   | 送るパラメータ                                                                  | GTM実装メモ                                                                |
| --------------------------- | ----------------------------- | -------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `lp_viewed`                 | LP訪問数の計測                | LP表示完了時に1回                | `page_type: "lp"`, `page_path`, `page_title`, `device_type`                     | GA4 Configuration 後に page_view と合わせて送る。SPA再描画で重複送信しない |
| `lp_primary_cta_clicked`    | ファーストビューCTAの反応計測 | HeroSection の CTA クリック時    | `cta_location: "hero"`, `cta_label`, `page_type: "lp"`                          | GTM の click trigger か dataLayer push で送る                              |
| `lp_secondary_cta_clicked`  | 下部CTAの反応計測             | BetaCtaSection の CTA クリック時 | `cta_location: "bottom"`, `cta_label`, `page_type: "lp"`                        | primary と同じ命名規則にそろえる                                           |
| `lp_waitlist_form_opened`   | モーダル到達率の計測          | 先行登録モーダル表示時           | `open_source: "hero" \| "bottom"`, `page_type: "lp"`                            | CTA click とは別に、実際にモーダルが開いた時点で送る                       |
| `lp_waitlist_submitted`     | 登録完了数の計測              | フォーム送信成功時               | `form_type: "waitlist"`, `graduation_year`, `hearing_opt_in`, `page_type: "lp"` | メールアドレス本文は送らない。成功レスポンス後に送信                       |
| `lp_waitlist_submit_failed` | 登録失敗率の計測              | フォーム送信失敗時               | `form_type: "waitlist"`, `error_type`, `page_type: "lp"`                        | バリデーション失敗とAPI失敗は `error_type` で分ける                        |

補足:

- `graduation_year` は個人特定にならない粒度で送る。
- `hearing_opt_in` は `true/false` のみ送る。
- 自由記述の悩み本文は計測に送らない。

### GTM の dataLayer 設計

LP実装側では、必要に応じて次の形で `dataLayer.push()` できるようにする。

```ts
window.dataLayer?.push({
  event: "lp_primary_cta_clicked",
  cta_location: "hero",
  cta_label: "先行利用に登録する",
  page_type: "lp",
});
```

推奨キー:

- `event`
- `page_type`
- `cta_location`
- `cta_label`
- `form_type`
- `graduation_year`
- `hearing_opt_in`
- `error_type`

### Clarity の見方

- Clarity は主に次の確認に使う。
  - HeroSection からCTAまで到達しているか
  - ProblemSection / HowItWorksSection で離脱が増えていないか
  - モーダル表示後に入力で詰まっていないか
- そのため、GA4 を「件数の正」、Clarity を「行動理由の補助」として扱う。

補足:

- 既存の [src/features/analytics/index.ts](src/features/analytics/index.ts) はサーバー側イベント前提なので、LP用イベント追加時は型拡張が必要。
- メールアドレスはイベントに含めない。

## 9. 実装順

1. [src/app/page.tsx](src/app/page.tsx) を LP構成へ差し替える
2. `content.ts` に文言を移す
3. `LeadCaptureDialog` と `LeadCaptureForm` を追加する
4. `POST /api/waitlist` を追加する
5. CTA/送信イベントの計測を足す
6. mobile → desktop の順で見た目を調整する

## 10. 初回実装で削ってよいもの

- イラストや画像アセット
- アニメーション
- 比較表の装飾
- FAQ再掲
- ヒアリング日程調整の自動化
