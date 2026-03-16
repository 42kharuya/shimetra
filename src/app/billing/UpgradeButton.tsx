"use client";

import { useState } from "react";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "エラーが発生しました。再試行してください。");
        return;
      }

      // Stripe Checkout ページへリダイレクト
      window.location.href = data.url;
    } catch {
      setError("ネットワークエラーが発生しました。再試行してください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-3 rounded bg-red-50 px-4 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        className="rounded bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        disabled={loading}
        onClick={handleUpgrade}
        type="button"
      >
        {loading ? "処理中..." : "Pro にアップグレード（980円/月）"}
      </button>
    </div>
  );
}
