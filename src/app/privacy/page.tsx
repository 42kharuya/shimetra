import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | 〆トラ",
};

export default function PrivacyPage() {
  const updatedAt = "2026年3月18日";

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed text-slate-700">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        プライバシーポリシー
      </h1>
      <p className="mb-8 text-xs text-slate-500">最終更新: {updatedAt}</p>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">1. 取得する情報</h2>
        <p>本サービスは以下の情報を取得します。</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>
            <strong>メールアドレス</strong>：ログイン・通知送付のために取得
          </li>
          <li>
            <strong>締切データ</strong>：ユーザーが入力した企業名・締切日時・ステータス等
          </li>
          <li>
            <strong>課金情報</strong>：Stripe が処理。カード番号等の決済情報は当サービスに保存されません
          </li>
          <li>
            <strong>アクセスログ</strong>：サービス改善・不正利用防止のために取得
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">2. 利用目的</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>ログイン認証（マジックリンク）の送付</li>
          <li>締切前のメール通知の送付</li>
          <li>有料プランの管理・決済処理</li>
          <li>サービス改善のための利用状況分析</li>
          <li>本人確認・不正利用防止</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">
          3. 第三者への提供
        </h2>
        <p>
          法令に基づく場合を除き、取得した個人情報を第三者に提供しません。
          ただし、以下のサービスに必要最小限の情報を提供します。
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>
            <strong>Stripe</strong>（決済処理）：
            <a
              href="https://stripe.com/jp/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Stripe プライバシーポリシー
            </a>
          </li>
          <li>
            <strong>Resend</strong>（メール送信）：メールアドレス・本文を送信のために共有
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">4. データの保管</h2>
        <p>
          取得したデータはクラウドサーバー（Vercel + PostgreSQL）に保管します。
          不正アクセス防止のための適切な技術的措置を講じています。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">
          5. 保持期間・削除
        </h2>
        <p>
          アカウントを削除すると、関連する全データ（締切データ・通知履歴）を削除します。
          削除依頼はメールにてお問い合わせください：
          <a
            href="mailto:support@shimetra.com"
            className="ml-1 text-blue-600 hover:underline"
          >
            support@shimetra.com
          </a>
          <br />
          <span className="text-xs text-slate-500">（※ドメインはローンチ前に実際のアドレスに変更してください）</span>
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">6. Cookie・計測</h2>
        <p>
          セッション管理のためにCookieを使用します。
          また、サービス改善のためアクセス解析（ページビュー・イベント計測）を行います。
          個人を特定する情報は計測データに含めません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">7. お問い合わせ</h2>
        <p>
          個人情報の開示・訂正・削除に関するご要望は下記にご連絡ください。
          <br />
          メール：
          <a
            href="mailto:support@shimetra.com"
            className="text-blue-600 hover:underline"
          >
            support@shimetra.com
          </a>
        </p>
      </section>

      <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
        <Link href="/" className="text-blue-600 hover:underline">
          ← トップへ戻る
        </Link>
        <span className="mx-3">|</span>
        <Link href="/terms" className="text-blue-600 hover:underline">
          利用規約
        </Link>
      </div>
    </main>
  );
}
