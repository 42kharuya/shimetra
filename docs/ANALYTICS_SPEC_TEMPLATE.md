# Analytics Spec Template（イベント/プロパティ/KPI）

このテンプレは「最小の計測」を先に決めて、実装と運用を楽にするためのものです。

## 1) 北極星指標（North Star）

- 指標名:
- 定義（1文）:
- なぜこれか:

## 2) KPI（最初の2週間）

- アクティベーション率: $= \frac{\text{activation users}}{\text{signup users}}$
- 継続率（例）: $= \frac{\text{D7 active}}{\text{D0 cohort}}$
- 課金率（課金するなら）:

## 3) イベント一覧（最低限）

| event_name | いつ発火         | 目的     | 必須プロパティ        | 任意プロパティ |
| ---------- | ---------------- | -------- | --------------------- | -------------- |
| signup     | 登録完了時       | 獲得計測 | user_id, method       | referrer       |
| activation | 初回成功体験完了 | 価値検証 | user_id, step         | time_to_value  |
| purchase   | 購入/申込完了    | 収益計測 | user_id, plan, amount | coupon         |

### utm（推奨）

流入別の効果測定をしたい場合、可能な範囲で付与します（[docs/SEO_GTM_CHECKLIST.md](SEO_GTM_CHECKLIST.md)）。

- utm_source:
- utm_medium:
- utm_campaign:
- utm_content（任意）:

### 命名ルール

- 小文字 + snake_case
- 意味が被るイベントを増やさない（迷ったら統合）

## 4) プライバシー/取り扱い注意

- 収集しない情報（PII/機微情報）:
- 保存期間:
- 同意（必要なら）:
