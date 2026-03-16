import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">就活締切トラッカー（MVP）</h1>
      <p className="mt-2 text-slate-700">
        締切を登録して、締切前に通知で“出し忘れ”を防ぐ。
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-slate-900 px-4 py-2 text-white"
        >
          ログイン
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-slate-300 px-4 py-2"
        >
          ダッシュボード
        </Link>
      </div>

      <div className="mt-8 grid gap-2 text-sm">
        <Link className="underline" href="/deadline/new">
          /deadline/new
        </Link>
        <Link className="underline" href="/billing">
          /billing
        </Link>
      </div>
    </main>
  );
}
