import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 | 就活締切トラッカー",
};

export default function TermsPage() {
  const updatedAt = "2026年3月18日";

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed text-slate-700">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">利用規約</h1>
      <p className="mb-8 text-xs text-slate-500">最終更新: {updatedAt}</p>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">第1条（適用）</h2>
        <p>
          本規約は、就活締切トラッカー（以下「本サービス」）の利用条件を定めるものです。
          ユーザーは本規約に同意した上で本サービスをご利用ください。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">第2条（利用登録）</h2>
        <p>
          登録を申請した方が本規約に同意し、運営者が登録を承認した時点で利用登録が完了します。
          以下に該当する場合、登録を拒否することがあります。
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>虚偽の情報を申請した場合</li>
          <li>過去に規約違反で利用停止になった場合</li>
          <li>その他、運営者が不適切と判断した場合</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">第3条（禁止事項）</h2>
        <p>以下の行為を禁止します。</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>法令または公序良俗に反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>サーバーやネットワークへの不正アクセス・妨害</li>
          <li>他のユーザーや第三者への迷惑行為</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>不正目的でのアカウント作成・利用</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">第4条（有料プラン）</h2>
        <p>
          有料プラン（Pro）の料金は月額980円（税込）です。
          決済は Stripe を通じて処理されます。
          サブスクリプションの解約はいつでもマイページから行えます。
          解約後は次回更新日まで引き続きご利用いただけます。返金は原則行いません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">第5条（免責事項）</h2>
        <p>
          運営者は、本サービスに関して以下の事項について一切の責任を負いません。
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>通知メールの遅延・未着に起因する締切ミス</li>
          <li>サービス停止・中断・データ消失による損害</li>
          <li>ユーザー間またはユーザーと第三者の間のトラブル</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">第6条（利用規約の変更）</h2>
        <p>
          運営者は必要に応じて本規約を変更できます。
          変更後も本サービスを継続してご利用の場合、変更後の規約に同意したものとみなします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900">第7条（準拠法・裁判管轄）</h2>
        <p>
          本規約の解釈は日本法に準拠します。
          紛争が生じた場合は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </p>
      </section>

      <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
        <Link href="/" className="text-blue-600 hover:underline">
          ← トップへ戻る
        </Link>
        <span className="mx-3">|</span>
        <Link href="/privacy" className="text-blue-600 hover:underline">
          プライバシーポリシー
        </Link>
      </div>
    </main>
  );
}
