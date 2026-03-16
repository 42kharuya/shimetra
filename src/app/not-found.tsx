import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">ページが見つかりません</h1>
      <div className="mt-6">
        <Link className="underline" href="/">
          / に戻る
        </Link>
      </div>
    </main>
  );
}
