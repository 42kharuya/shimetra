import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ダッシュボード</h1>
        <Link
          href="/deadline/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
        >
          新規作成
        </Link>
      </div>
      <p className="mt-4 text-slate-700">（ここに締切一覧が入ります）</p>
    </main>
  );
}
