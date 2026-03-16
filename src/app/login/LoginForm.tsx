"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "loading" | "sent" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  expired: "リンクが無効または期限切れです。再度送信してください。",
  invalid: "無効なリンクです。再度ログインしてください。",
  server: "サーバーエラーが発生しました。しばらく後にお試しください。",
};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [apiError, setApiError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setApiError("");

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("sent");
      } else {
        const data = await res.json().catch(() => ({}));
        setApiError(data.error ?? "送信に失敗しました");
        setStatus("error");
      }
    } catch {
      setApiError("ネットワークエラーが発生しました");
      setStatus("error");
    }
  }

  return (
    <div className="mt-6">
      {/* URL のエラークエリ（expired / invalid / server） */}
      {urlError && ERROR_MESSAGES[urlError] && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {ERROR_MESSAGES[urlError]}
        </p>
      )}

      {status === "sent" ? (
        <div className="rounded-lg bg-green-50 px-4 py-4 text-sm text-green-800">
          <p className="font-semibold">メールを送信しました 📬</p>
          <p className="mt-1">
            <span className="font-mono text-xs">{email}</span>{" "}
            宛にログインリンクを送りました。
          </p>
          <p className="mt-2 text-xs text-green-700">
            リンクの有効期限は 30 分です。届かない場合は迷惑メールをご確認ください。
          </p>
          <button
            onClick={() => {
              setStatus("idle");
              setEmail("");
            }}
            className="mt-3 text-xs text-green-700 underline"
          >
            別のアドレスで送り直す
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {status === "error" && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {status === "loading" ? "送信中…" : "マジックリンクを送信"}
          </button>
        </form>
      )}
    </div>
  );
}
