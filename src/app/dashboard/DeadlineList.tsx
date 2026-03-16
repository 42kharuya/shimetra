"use client";

import { useState } from "react";
import Link from "next/link";
import {
  formatDeadline,
  getUrgencyLevel,
  URGENCY_CLASS,
  KIND_LABEL,
  STATUS_LABEL,
} from "@/lib/deadlines/format";

export type DeadlineItem = {
  id: string;
  companyName: string;
  kind: "es" | "briefing" | "interview" | "other";
  deadlineAt: string; // ISO string（Server Component から文字列で渡す）
  status: "todo" | "submitted" | "done" | "canceled";
  link: string | null;
  memo: string | null;
};

type Props = {
  initialItems: DeadlineItem[];
};

/**
 * ダッシュボード締切一覧 クライアントコンポーネント
 *
 * - initialItems を Server Component から受け取り、ローカル state で管理する
 * - ステータス変更は楽観的更新 → PATCH /api/deadlines/:id → 失敗時ロールバック
 * - 0件のときは空状態 UI（2件登録を促す導線）を表示する
 */
export default function DeadlineList({ initialItems }: Props) {
  const [items, setItems] = useState<DeadlineItem[]>(initialItems);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleStatusChange(id: string, newStatus: string) {
    const prevItems = items; // ロールバック用に退避

    setUpdatingId(id);
    setErrorMsg(null);

    // 楽観的更新
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: newStatus as DeadlineItem["status"] }
          : item,
      ),
    );

    try {
      const res = await fetch(`/api/deadlines/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "ステータスの更新に失敗しました");
      }
    } catch (err) {
      setItems(prevItems); // ロールバック
      setErrorMsg(
        err instanceof Error ? err.message : "ステータスの更新に失敗しました",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // ── 空状態 ──────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-lg border-2 border-dashed border-slate-200 py-14 text-center">
        <p className="text-sm font-medium text-slate-600">
          締切アイテムがまだありません
        </p>
        <p className="mt-1 text-xs text-slate-400">
          まずは<span className="font-semibold text-slate-600">2件登録</span>
          して、締切管理をスタートしましょう 🎯
        </p>
        <Link
          href="/deadline/new"
          className="mt-5 inline-block rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          + 締切を登録する
        </Link>
      </div>
    );
  }

  // ── 一覧 ────────────────────────────────────────────────────────────────
  return (
    <div className="mt-4">
      {errorMsg && (
        <div
          role="alert"
          className="mb-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600"
        >
          ⚠ {errorMsg}
        </div>
      )}

      <ul className="space-y-3">
        {items.map((item) => {
          const urgency = getUrgencyLevel(item.deadlineAt);
          const isUpdating = updatingId === item.id;

          return (
            <li
              key={item.id}
              className={`rounded-lg px-4 py-3 shadow-sm transition-opacity ${URGENCY_CLASS[urgency]} ${isUpdating ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* 左列：企業名・種別・日時・リンク・メモ */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {item.companyName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-1 py-0.5 font-medium text-slate-600">
                      {KIND_LABEL[item.kind]}
                    </span>
                    {"　"}
                    {formatDeadline(item.deadlineAt)}
                  </p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-block max-w-xs truncate text-xs text-blue-600 underline"
                    >
                      公募リンク ↗
                    </a>
                  )}
                  {item.memo && (
                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                      {item.memo}
                    </p>
                  )}
                </div>

                {/* 右列：ステータスセレクト（1操作で即更新） */}
                <select
                  value={item.status}
                  disabled={isUpdating}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  aria-label={`${item.companyName}のステータスを変更`}
                  className="shrink-0 cursor-pointer rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
