"use client";

/**
 * LeadCaptureForm — 先行登録フォーム
 * docs/LP.md § LeadCaptureForm に準拠
 *
 * - メールアドレス（必須）
 * - 卒業年度（必須）
 * - 今の悩み（任意）
 * - ヒアリング参加可否（任意）
 */

import { useState } from "react";

/** window.dataLayer push helper（型は最小限） */
function pushDataLayer(payload: Record<string, unknown>) {
  const win = window as Window & { dataLayer?: unknown[] };
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push(payload);
}

const CURRENT_YEAR = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i);

interface LeadCaptureFormProps {
  onSuccess: () => void;
}

export function LeadCaptureForm({ onSuccess }: LeadCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [graduationYear, setGraduationYear] = useState<string>(
    String(CURRENT_YEAR + 1),
  );
  const [concerns, setConcerns] = useState("");
  const [hearingOptIn, setHearingOptIn] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // ── クライアントサイドバリデーション ────────────────────────────
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError("メールアドレスを入力してください");
      pushDataLayer({
        event: "lp_waitlist_submit_failed",
        form_type: "waitlist",
        error_type: "validation",
        page_type: "lp",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError("正しいメールアドレスを入力してください");
      pushDataLayer({
        event: "lp_waitlist_submit_failed",
        form_type: "waitlist",
        error_type: "validation",
        page_type: "lp",
      });
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailTrimmed,
          graduationYear: Number(graduationYear),
          concerns: concerns.trim() || undefined,
          hearingOptIn: hearingOptIn,
        }),
      });

      if (res.ok) {
        pushDataLayer({
          event: "lp_waitlist_submitted",
          form_type: "waitlist",
          graduation_year: Number(graduationYear),
          hearing_opt_in: hearingOptIn ?? null,
          page_type: "lp",
        });
        onSuccess();
        return;
      }

      const data = await res.json().catch(() => ({})) as { error?: string };
      const msg =
        res.status === 409
          ? "このメールアドレスはすでに登録されています"
          : (data.error ?? "送信に失敗しました。しばらく後にお試しください");

      setError(msg);
      pushDataLayer({
        event: "lp_waitlist_submit_failed",
        form_type: "waitlist",
        error_type: res.status === 409 ? "duplicate" : "api_error",
        page_type: "lp",
      });
    } catch {
      setError("送信に失敗しました。しばらく後にお試しください");
      pushDataLayer({
        event: "lp_waitlist_submit_failed",
        form_type: "waitlist",
        error_type: "network_error",
        page_type: "lp",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* メールアドレス */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "#4d4c48" }}>
          メールアドレス <span style={{ color: "#b53333" }}>*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          required
          autoComplete="email"
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2"
          style={{
            borderColor: "#e8e6dc",
            backgroundColor: "#faf9f5",
            color: "#141413",
          }}
        />
      </div>

      {/* 卒業年度 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "#4d4c48" }}>
          卒業年度 <span style={{ color: "#b53333" }}>*</span>
        </label>
        <select
          value={graduationYear}
          onChange={(e) => setGraduationYear(e.target.value)}
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2"
          style={{
            borderColor: "#e8e6dc",
            backgroundColor: "#faf9f5",
            color: "#141413",
          }}
        >
          {GRADUATION_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}年3月卒
            </option>
          ))}
        </select>
      </div>

      {/* 今の悩み（任意） */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "#4d4c48" }}>
          今の悩み{" "}
          <span className="text-xs font-normal" style={{ color: "#87867f" }}>
            （任意）
          </span>
        </label>
        <textarea
          value={concerns}
          onChange={(e) => setConcerns(e.target.value)}
          rows={3}
          placeholder="例：自己分析が終わらない、どの業界を見ればいいかわからない…"
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 resize-none"
          style={{
            borderColor: "#e8e6dc",
            backgroundColor: "#faf9f5",
            color: "#141413",
          }}
        />
      </div>

      {/* ヒアリング参加可否（任意） */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium" style={{ color: "#4d4c48" }}>
          ヒアリング参加可否{" "}
          <span className="text-xs font-normal" style={{ color: "#87867f" }}>
            （任意）
          </span>
        </span>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#5e5d59" }}>
            <input
              type="radio"
              name="hearingOptIn"
              checked={hearingOptIn === true}
              onChange={() => setHearingOptIn(true)}
              className="accent-current"
            />
            はい
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#5e5d59" }}>
            <input
              type="radio"
              name="hearingOptIn"
              checked={hearingOptIn === false}
              onChange={() => setHearingOptIn(false)}
              className="accent-current"
            />
            いいえ
          </label>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <p className="text-sm" style={{ color: "#b53333" }}>
          {error}
        </p>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#c96442", color: "#faf9f5" }}
      >
        {pending ? "送信中..." : "登録して案内を受け取る"}
      </button>

      <p className="text-center text-xs" style={{ color: "#87867f" }}>
        無料です / 後日ご案内します
      </p>
    </form>
  );
}
