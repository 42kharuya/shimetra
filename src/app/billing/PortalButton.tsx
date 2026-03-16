"use client";

import { useState } from "react";

/**
 * Stripe Customer Portal へ遷移するボタン（Pro ユーザー向け）
 * 解約・支払い方法変更などをStripeに委譲する。
 */
export function PortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePortal() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.url) {
        setError(data?.error ?? "エラーが発生しました。再試行してください。");
        return;
      }

      // Stripe Customer Portal へリダイレクト
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
        className="rounded border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        disabled={loading}
        onClick={handlePortal}
        type="button"
      >
        {loading ? "処理中..." : "管理画面へ（解約・支払い方法変更）"}
      </button>
    </div>
  );
}
