/**
 * src/config/plans.ts
 *
 * プラン定義の一元管理ファイル。
 * UI（page.tsx など）・ロジック（gate.ts など）双方からインポートして使用する。
 */

/** Free ユーザーが作成できる最大件数 */
export const FREE_ITEM_LIMIT = 10;

/** Free プランの機能一覧（UI 表示用） */
export const FREE_FEATURES = [
  `締切アイテム ${FREE_ITEM_LIMIT}件まで`,
  "締切 24時間前のメール通知",
  "ステータス管理（応募予定・提出済など）",
] as const;

/** Pro プランの機能一覧（UI 表示用） */
export const PRO_FEATURES = [
  "締切アイテム 無制限",
  "締切 72時間 / 24時間 / 3時間前の通知",
  "FREE の全機能",
] as const;

/** Pro プランの月額料金（円、税込） */
export const PRO_PRICE_JPY = 980;
