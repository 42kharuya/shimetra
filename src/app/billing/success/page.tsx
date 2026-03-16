import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">購入が完了しました</h1>
      <p className="mt-2 text-slate-700">Proの有効化を確認中です。</p>
      <div className="mt-6">
        <Link className="underline" href="/dashboard">
          ダッシュボードへ
        </Link>
      </div>
    </main>
  );
}
