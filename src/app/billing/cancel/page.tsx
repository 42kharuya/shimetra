import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">課金をキャンセルしました</h1>
      <p className="mt-2 text-slate-700">必要になったらいつでもアップグレードできます。</p>
      <div className="mt-6">
        <Link className="underline" href="/billing">
          /billing に戻る
        </Link>
      </div>
    </main>
  );
}
