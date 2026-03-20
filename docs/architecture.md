# Architecture Notes

このドキュメントは「決定事項（Decision）」「理由（Rationale）」「代替案（Alternatives）」「影響（Impact）」を簡潔に残す場所です。

## ADR（MVP）

### 0001: MVPの技術前提（Hosting/Auth/DB/Timezone）

- Decision:
  - Hosting: Cloudflare Workers（`@opennextjs/cloudflare` v1）
  - Auth: メールマジックリンク（パスワードなし）
  - DB/ORM: Neon PostgreSQL（`@neondatabase/serverless`）+ Prisma 7
  - Timezone: JST固定（ユーザーTZは保持しない）
- Rationale:
  - 2週間MVP・1人開発の制約下で、実装/運用コストを最小化しつつ要件（締切管理・通知・課金）を満たす。
  - Cloudflare Workersはエッジ実行・無料枠が広く、Cron Triggersが組み込みで使えるためMVPに適合する。
  - マジックリンクはパスワード管理/リセット導線が不要で、MVPの認証実装を短縮できる。
  - Prisma + Neon PostgreSQLはサーバーレス対応で型安全・マイグレーション運用が枯れており、CRUD中心のMVPに適合する。
  - 日本向け前提のためJST固定にして日時バグの面積を減らす。
- Alternatives:
  - Hosting: Vercel / AWS
  - Auth: メール+パスワード（確認メールあり）、Supabase Auth等のマネージドAuth
  - ORM: Drizzle
  - Timezone: ユーザーTZ保存（将来拡張に強いが工数増）
- Impact:
  - Cloudflare Workers + Cron Triggersを前提としたAPI設計になる。
  - Neon PostgreSQLはWebSocket接続（`@neondatabase/serverless`）でCloudflare Workersと接続する。
  - 認証はメール到達性が重要になるため、メール基盤/ドメイン設定が運用品質に直結する。
  - Signupの定義（PRD準拠）：メール確認（マジックリンクのクリック）が完了し、ユーザー作成が確定した時点。
  - タイムゾーン対応は後で拡張する（現時点はJSTのみ）。

### 0002: MVPのデータモデル（最小スキーマ）

- Decision:
  - MVPの永続化は以下のテーブルで構成する。
    - users
      - id (uuid)
      - email (unique)
      - created_at
    - deadline_items
      - id (uuid)
      - user_id (FK)
      - company_name
      - kind (enum: es | briefing | interview | other)
      - deadline_at (timestamptz)
      - status (enum: todo | submitted | done | canceled)
      - link (nullable)
      - memo (nullable)
      - status_changed_at (nullable, statusをsubmittedに更新した時刻＝北極星指標の計測用)
      - created_at / updated_at
    - subscriptions
      - id (uuid)
      - user_id (unique)
      - stripe_customer_id
      - stripe_subscription_id
      - status (Stripe subscription statusをミラー。値はStripe準拠の文字列として保持し、列挙で縛らない。例: trialing | active | past_due | canceled | unpaid | incomplete | incomplete_expired | paused)
      - plan (enum: free | pro)
      - current_period_end (timestamptz, nullable)
      - updated_at
    - notification_deliveries
      - id (uuid)
      - deadline_item_id (FK)
      - offset_minutes (int)
      - scheduled_for (timestamptz)
      - sent_at (nullable)
      - provider_message_id (nullable)
      - status (enum: scheduled | sent | failed)
      - error (nullable)
      - created_at
  - 重複送信防止のため、notification_deliveries に (deadline_item_id, offset_minutes) の一意制約を置く。
  - Stripe連携の整合性のため、subscriptions の stripe_customer_id / stripe_subscription_id は unique を推奨する。
  - 主要クエリ最適化として deadline_items(user_id, deadline_at) に複合インデックスを置く。
- Rationale:
  - PRDの価値（締切前に確実に気づく）を担保するには、通知の送信結果を追跡できる最小ログが必要。
  - 課金状態はStripeがソースだが、画面/APIの高速化と実装単純化のため subscriptions をローカルに保持する。
  - JST固定でも timestamptz にしておくと、将来TZ対応/運用の安全性が上がる。
- Alternatives:
  - statusを todo/submitted の2値に絞る（MVP最小。ただし辞退/終了の整理がしづらい）
  - subscriptionsを持たず、都度Stripe参照（整合は高いが実装が散らばりやすい）
  - notification_deliveriesを持たず、送信はベストエフォート（取りこぼし/重複の検知が難しい）
  - RLS（DB側認可）を導入（堅牢だがMVP工数増）
- Impact:
  - Cron/Webhookの冪等設計がDB制約に依存する（制約の誤りは通知事故に直結）。
  - 監査/CS対応の最小材料として、通知失敗の原因を error に保持できる。
  - 北極星指標（締切前に提出済へ更新できた件数）は、status_changed_at と deadline_at の比較（status_changed_at < deadline_at）で集計できる。
  - statusのUI語彙は以下に対応させる。
    - todo: 未対応
    - submitted: 提出済（北極星指標の対象）
    - done: 完了（例：選考終了など。北極星指標の対象外）
    - canceled: 辞退/中止（北極星指標の対象外）
  - status_changed_at は status を submitted に更新した時刻のみを記録する（他ステータス変更では更新しない）。

### 0003: MVPの画面構成（最小ルーティング）

- Decision:
  - MVPの画面は以下に限定する。
    - / : LP（価値訴求、価格、CTA）
    - /login : メール入力 → マジックリンク送付（ログイン/サインアップ共通）
    - /dashboard : 締切一覧（締切が近い順）/追加/ステータス更新/無料枠残数/Pro誘導
    - /deadline/new : 締切作成フォーム（編集は最小で同等UIに統合可）
    - /billing : ペイウォール（Pro機能説明 + Upgrade）
    - /billing/success, /billing/cancel : Stripeリダイレクト着地
- Rationale:
  - 北極星（締切前に提出済へ更新できた件数）までの導線を最短にする。
  - CRUDと課金だけに集中し、モーダル等の複雑UIは避ける。
- Alternatives:
  - ダッシュボード単一画面（作成/編集も同一画面内）
  - LP無し（即ログイン）
- Impact:
  - 空状態（締切なし/無料枠到達/通知対象なし）を最低限設計しないと離脱が増える。
  - Pro誘導は無料枠到達時と通知段数の差分の2点に集中する。

### 0004: MVPのAPI設計（締切/課金/通知）

- Decision:
  - APIは3領域に限定し、Cloudflare Workers上のEdge APIとして実装する（フレームワークはNext.js App Router、パスは /api/... に統一）。
    - 締切CRUD
      - GET /api/deadlines
      - POST /api/deadlines （Freeは10件制限）
      - PATCH /api/deadlines/:id （status更新を含む）
      - DELETE /api/deadlines/:id
    - Stripe
      - POST /api/stripe/checkout （Checkout Session作成）
      - POST /api/stripe/webhook （署名検証→subscriptions更新）
      - POST /api/stripe/portal （Customer Portal Session作成）
    - 通知（Cloudflare Cron Triggers）
      - POST /api/cron/notify （CRON_SECRETで保護、対象抽出→メール送信）
- Rationale:
  - 要件の中心が締切・通知・課金であり、それ以外のAPIはMVPに不要。
  - Webhook/Cronは冪等が必須のため、APIを分離して責務を明確にする。
- Alternatives:
  - Queue/Worker導入（厳密スケジューリングは強いがMVP工数増）
  - Stripeを都度参照して課金状態を判定（整合性は上がるが、表示/APIが複雑化）
- Impact:
  - すべての書き込み系APIに入力バリデーションが必要（deadline_at, kind, URL等）。
  - 無料枠制限は必ずサーバー側で enforce し、UIだけに依存しない。
  - Stripe Webhookは再送されるため、subscriptions更新は stripe_subscription_id をキーに upsert する等、冪等に処理する。

### 0005: 通知の信頼性設計（冪等・重複防止・到達性）

- Decision:
  - 通知は「Cron + DBログ + 一意制約 + 冪等」で担保する。
  - offsetはFree=24h前、Pro=72h/24h/3h（分換算で管理）とし、notification_deliveriesに送信記録を残す。
  - Cronは5〜10分間隔で実行し、対象抽出は「現在時刻から一定ウィンドウ内に入った scheduled_for」を条件にする。
  - 冪等の基本戦略は「notification_deliveries を先に作ってから送る」とし、作成時は status=scheduled、送信成功で sent、失敗で failed に更新する。
  - scheduled_for は deadline_at - offset_minutes で算出する。
- Rationale:
  - Cronの遅延/再実行は起こり得るため、DB側で重複送信を防げる設計が必要。
  - “確実に通知”を実現するには、送信ログと失敗理由を保持して再送/調査可能にする必要がある。
- Alternatives:
  - 配信ログ無しのベストエフォート送信
  - ジョブキュー/ワーカーでの正確なスケジューリング
- Impact:
  - notification_deliveriesの一意制約が通知品質の要になる。
  - メール基盤の障害時は failed を記録し、運用上の再送手段を後から追加できる余地が残る。

### 0006: 主要リスクと対策（MVPで最低限やること）

- Decision:
  - 主要リスクは以下に絞り、MVPでも最低限のガードを入れる。
    - メール到達性
    - Cronの取りこぼし/重複
    - Stripe課金整合
    - 認可不備による漏洩
    - 日時ズレ（JST固定運用）
- Rationale:
  - PRDの価値は通知の信頼性に依存し、課金整合とデータ漏洩は致命傷になりやすい。
- Alternatives:
  - 通知品質を捨てて締切一覧のみで公開
  - Push/LINEへ寄せる（ただしMVPスコープ外）
- Impact:
  - 対策（最低限）
    - メール: トランザクションメール基盤採用 + SPF/DKIM/DMARC整備
    - Cron: ウィンドウ抽出 + DB一意制約で重複防止
    - Stripe: Webhook署名検証 + subscriptionsをWebhookで更新し、UIはDBのみ参照
    - 認可: 全CRUDでuser_idスコープ徹底（ID直指定でも他人のデータを返さない）
    - 日時: timestamptz保存 + 表示/文面はJST統一

### 0007: MVPの課金プラン定義（Free/Proの機能差と価格）

- Decision:
  - 料金と機能差分はPRDの定義を採用する。
    - Free: アイテム10件まで、通知は24h前のみ
    - Pro: 980円/月、アイテム無制限、通知は72h/24h/3h
  - サーバー側の判定は subscriptions.plan をソースとし、Stripe Webhookで更新する。
- Rationale:
  - ペイウォールの境界（何が有料か）を仕様として固定しないと、UI/API/通知ロジックがブレる。
  - 課金状態はStripeが真だが、アプリ側はDB参照で高速・単純にしたい。
- Alternatives:
  - Proを「複数通知のみ（件数制限は維持）」にする（差分が弱く課金理由が薄い）
  - 課金状態を都度Stripe参照にする（整合性は上がるが実装が散らばる）
- Impact:
  - POST /api/deadlines の作成制限（10件）は plan=free のときのみ enforce する。
  - /billing の表示文言（価格・機能差）はこのADRを単一の正とする。
  - Pro権限は webhook で計算して plan に反映する（アプリ側は原則 plan を参照）。最低限のルールは「statusが active/trialing の間はpro」「statusがcanceledでも current_period_end が未来ならpro（期間満了までは利用可）」。

### 0008: MVPの計測（イベント最小セットとプライバシー）

- Decision:
  - 計測のソースオブトゥルースは Analytics Spec とし、MVPは以下の最小イベントのみを送る。
    - signup（メール確認完了＝ユーザー作成確定）
    - activation（signup後24時間以内に締切2件作成を満たした瞬間をサーバーで1回だけ確定）
    - dashboard_viewed（D7継続の計測用）
    - purchase（Stripeでサブスクがactiveになったとき。Webhook起点）
  - プライバシー：メモ/リンク等の本文、メールアドレス等のPIIはイベントに含めない。
- Rationale:
  - PRDのKPI（Activation/D7/課金/北極星）を最小の実装で追えるようにする。
  - activationはクライアントの重複発火を避けるため、サーバー側で確定する。
- Alternatives:
  - 全操作イベントを網羅（学びは増えるがMVPで計測/分析が重くなる）
  - 計測を後回し（2週間で学びが取れず、Kill criteria判定が曖昧になる）
- Impact:
  - イベント仕様の詳細は docs/ANALYTICS_SPEC.md を参照し、命名は snake_case に統一する。
  - 北極星指標はDB集計（status_changed_at < deadline_at）で算出し、イベントに本文を載せない。
