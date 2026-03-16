import Link from "next/link";

export default function NewDeadlinePage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold">締切の新規作成</h1>
      <p className="mt-2 text-slate-700">（ここに作成フォームが入ります）</p>

      <div className="mt-6">
        <Link className="underline" href="/dashboard">
          ダッシュボードに戻る
        </Link>
      </div>
    </main>
  );
}
