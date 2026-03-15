# MVP Backlog（就活締切トラッカー）

目的: PRD/ADRを「1 Issue=1〜3時間〜半日」で実装可能な粒度に分割する。

凡例:

- 優先度: P0（ブロッカー）/ P1（MVP必須）/ P2（できれば）
- 推定: S（1〜3h）/ M（〜半日）/ L（半日上限・要分割検討）

---

## Issue一覧（提案：18件）

### I-01. [MVP] アプリ雛形（Next.js + TS + Tailwind）

- 目的: 最小のWebアプリ骨格を作り、以降の実装の土台を揃える
- AC:
  - [ ] ルーティング（/ /login /dashboard /deadline/new /billing /billing/success /billing/cancel）が作れる状態
  - [ ] ローカル起動手順がREADMEに1段落で書かれている
- 優先度: P0
- 依存関係: なし
- 推定: M

### I-02. [MVP] Prisma + Postgres スキーマ作成（ADR 0002 準拠）

- 目的: MVPの永続化（users/deadline_items/subscriptions/notification_deliveries）を確定する
- AC:
  - [ ] 4テーブル（+必要なenum）とインデックス/一意制約がマイグレーションで反映される
  - [ ] `notification_deliveries (deadline_item_id, offset_minutes)` に一意制約がある
  - [ ] `deadline_items (user_id, deadline_at)` 複合インデックスがある
- 優先度: P0
- 依存関係: I-01
- 推定: M

### I-03. [MVP] メールマジックリンク認証（ログイン/サインアップ共通）

- 目的: PRDのSignup定義（メール確認完了）を満たす認証導線を作る
- AC:
  - [ ] /login でメール入力→マジックリンク送付→クリックでログインできる
  - [ ] 未ログインで /dashboard 等にアクセスすると /login にリダイレクトされる
  - [ ] Signup確定タイミング（ユーザー作成確定）がサーバーで定義される
- 優先度: P0
- 依存関係: I-01, I-02, I-16
- 推定: M

### I-04. [MVP] Deadline Item 作成API（バリデーション+Free枠制限）

- 目的: 締切アイテムの登録をサーバー側で堅牢に受ける
- AC:
  - [ ] `POST /api/deadlines` が `company_name/kind/deadline_at/status/link/memo` を検証して保存する
  - [ ] Freeは10件までをサーバー側で enforce（超過時はエラー）
  - [ ] 作成はログインユーザーにスコープされ、他ユーザーに書き込めない
- 優先度: P0
- 依存関係: I-02, I-03
- 推定: M

### I-05. [MVP] Deadline Item 一覧API（締切近い順）

- 目的: ダッシュボード表示に必要な一覧取得を提供する
- AC:
  - [ ] `GET /api/deadlines` がログインユーザーのアイテムのみ返す
  - [ ] `deadline_at` 昇順（近い順）で返す
- 優先度: P0
- 依存関係: I-02, I-03
- 推定: S

### I-06. [MVP] Deadline Item 更新/削除API（ステータス更新含む）

- 目的: ステータス更新と編集/削除を可能にする
- AC:
  - [ ] `PATCH /api/deadlines/:id` で status 更新できる
  - [ ] status を `submitted` にした時だけ `status_changed_at` が設定される
  - [ ] `DELETE /api/deadlines/:id` がユーザースコープで動く
- 優先度: P0
- 依存関係: I-02, I-03
- 推定: M

### I-07. [MVP] LP（/）実装（価値訴求/価格/CTA）

- 目的: SNS→LP→ログインの導線を成立させる
- AC:
  - [ ] 価値提案（締切ミス防止）・価格（980円/月）・Free/Pro差分が載っている
  - [ ] CTAが /login へ遷移する
- 優先度: P1
- 依存関係: I-01
- 推定: S

### I-08. [MVP] ダッシュボードUI（締切近い順・空状態・ステータス即更新）

- 目的: コア体験（近い順確認→即更新）を実現する
- AC:
  - [ ] 締切が近い順に表示される
  - [ ] ステータス変更が1操作で反映される（API連携）
  - [ ] 空状態（0件）で「2件登録」を促す導線がある
- 優先度: P0
- 依存関係: I-05, I-06
- 推定: M

### I-09. [MVP] 締切作成フォーム（/deadline/new）

- 目的: 2件登録（Activation）を最短で達成できる入力体験を作る
- AC:
  - [ ] 必須項目（企業名/種別/締切日時）が入力でき、作成後に /dashboard へ戻る
  - [ ] 入力エラー時に理由が表示される
- 優先度: P0
- 依存関係: I-04
- 推定: M

### I-10. [MVP] Stripe Checkout 作成API（/billing からUpgrade）

- 目的: Pro購入導線を成立させる
- AC:
  - [ ] `POST /api/stripe/checkout` がCheckout Sessionを作成し、Stripeへ遷移できる
  - [ ] /billing にFree/Pro差分とUpgrade CTAがある
- 優先度: P0
- 依存関係: I-01, I-03
- 推定: M

### I-11. [MVP] Stripe Webhook（署名検証→subscriptions upsert）

- 目的: 課金状態をDBに同期し、アプリの権限判定を単純化する
- AC:
  - [ ] `POST /api/stripe/webhook` が署名検証を行う
  - [ ] `subscriptions` が `stripe_subscription_id` 等で冪等に upsert される
  - [ ] Pro判定ルール（active/trialing または current_period_end未来）を plan に反映できる
- 優先度: P0
- 依存関係: I-02, I-10
- 推定: M

### I-12. [MVP] Pro/Freeの機能ゲート（件数/通知段数）

- 目的: Free枠制限とPro差分が一貫して適用される
- AC:
  - [ ] Freeで10件超の作成がブロックされ、/billing へ誘導される
  - [ ] Proは件数無制限として扱われる
- 優先度: P0
- 依存関係: I-04, I-11
- 推定: S

### I-13. [MVP] /billing/success と /billing/cancel の着地ページ

- 目的: Stripeリダイレクト後の迷子を防ぐ
- AC:
  - [ ] success で「Pro有効化中/完了」メッセージと /dashboard 導線がある
  - [ ] cancel で「課金キャンセル」メッセージと /billing 導線がある
- 優先度: P1
- 依存関係: I-10
- 推定: S

### I-14. [MVP] Stripe Customer Portal API（解約/支払い方法変更）

- 目的: サブスク運用の最低限（解約/カード変更）をStripeに委譲する
- AC:
  - [ ] `POST /api/stripe/portal` がPortal Sessionを作成できる
  - [ ] /billing から「管理画面へ」導線がある（Proユーザー向け）
- 優先度: P1
- 依存関係: I-11
- 推定: S

### I-15. [MVP] 通知Cron（対象抽出→送信→notification_deliveries更新）

- 目的: PRD Must のメール通知（Free=24h, Pro=72h/24h/3h）を信頼性設計込みで実装する
- AC:
  - [ ] `POST /api/cron/notify` が `CRON_SECRET` で保護されている
  - [ ] 対象をウィンドウ抽出し、送信前に `notification_deliveries` を作成（重複防止）する
  - [ ] 成否で status（sent/failed）と error が更新される
- 優先度: P0
- 依存関係: I-02, I-11, I-16
- 推定: M

### I-16. [MVP] メール送信基盤（プロバイダ設定 + 送信ユーティリティ）

- 目的: 認証/通知で使うメール送信の土台を先に固める
- AC:
  - [ ] dev/prodでメール送信ができる（環境変数で切替）
  - [ ] 送信失敗時にエラーを捕捉でき、運用で追える形（ログ等）になっている
- 優先度: P0
- 依存関係: I-01
- 推定: M

### I-17. [MVP] 計測（signup/activation/dashboard_viewed/purchase）

- 目的: PRDのKill criteria判定に必要な最小計測を入れる
- AC:
  - [ ] `signup` は「メール確認完了＝ユーザー作成確定」で1回送られる
  - [ ] `activation` はサーバー側で「24h以内に2件作成」を満たした瞬間に1回だけ送られる
  - [ ] `dashboard_viewed` はダッシュボード表示時に送られる（重複は集計側で吸収）
  - [ ] `purchase` はStripe webhook起点で送られる（PIIを含めない）
- 優先度: P0
- 依存関係: I-03, I-04, I-08, I-11
- 推定: M

### I-18. [MVP] 環境変数・運用の最低限（.env.example/Secrets/Runbook草案）

- 目的: 本番運用で詰まりやすい設定/手順を先に可視化し、事故を減らす
- AC:
  - [ ] `.env.example` に必須/任意が整理されている（Stripe/Webhook/Cron/メール/DB/計測）
  - [ ] Cron/Webhookのシークレット運用（どこに設定するか）が短く書かれている
  - [ ] 失敗時の一次切り分け（ログの場所/再実行可否/ロールバック方針）が1ページにまとまっている
- 優先度: P1
- 依存関係: I-10, I-11, I-15
- 推定: S
