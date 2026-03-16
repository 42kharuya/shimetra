"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">エラーが発生しました</h1>
      <button
        type="button"
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white"
        onClick={() => reset()}
      >
        再読み込み
      </button>
    </main>
  );
}
