/**
 * 締切アイテム表示用ユーティリティ（純粋関数）
 *
 * JST 固定（ADR 0001 準拠）で日時表示を統一する。
 * 依存ゼロの純粋関数なので、tsx でそのままテストできる。
 */

export type UrgencyLevel = "overdue" | "today" | "soon" | "normal";

/**
 * deadline_at の ISO 文字列を「M/D HH:MM（残り表記）」形式にフォーマットする。
 * now を引数で受け取ることでテスト可能にしてある。
 */
export function formatDeadline(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const dateStr = date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffMs < 0) return `${dateStr}（期限切れ）`;
  if (diffDays <= 0) return `${dateStr}（今日）`;
  if (diffDays === 1) return `${dateStr}（明日）`;
  return `${dateStr}（${diffDays}日後）`;
}

/**
 * 緊急度レベルを返す（スタイル選択に使う）。
 * - overdue : 期限切れ
 * - today   : 24h 以内
 * - soon    : 3 日以内
 * - normal  : それ以外
 */
export function getUrgencyLevel(
  iso: string,
  now: Date = new Date(),
): UrgencyLevel {
  const date = new Date(iso);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffMs < 0) return "overdue";
  if (diffDays < 1) return "today";
  if (diffDays <= 3) return "soon";
  return "normal";
}

export const URGENCY_CLASS: Record<UrgencyLevel, string> = {
  overdue: "border-l-4 border-red-500 bg-red-50",
  today: "border-l-4 border-red-400 bg-red-50",
  soon: "border-l-4 border-yellow-400 bg-yellow-50",
  normal: "border-l-4 border-slate-200 bg-white",
};

export const KIND_LABEL: Record<string, string> = {
  es: "ES",
  briefing: "説明会",
  interview: "面接",
  other: "その他",
};

export const STATUS_LABEL: Record<string, string> = {
  todo: "未対応",
  submitted: "提出済",
  done: "完了",
  canceled: "辞退/中止",
};
