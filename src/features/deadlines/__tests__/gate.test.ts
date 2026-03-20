/**
 * src/lib/deadlines/__tests__/gate.test.ts
 *
 * gate.ts のユニットテスト（純粋に検証できる部分のみ）
 *
 *
 * テスト戦略:
 *  - FREE_ITEM_LIMIT: 定数値の検証
 *  - isProUser / getUserPlan: Prisma 依存のため DB不要な手動確認手順を参照
 *
 * === 手動確認手順 ===
 *
 * 1. Pro 判定（isProUser）
 *    a. DB に plan="pro", status="active" の subscriptions レコードを持つユーザーでログイン
 *       → POST /api/deadlines が 10件超でも 201 を返すこと
 *    b. plan="pro" だが status="canceled" かつ current_period_end が過去のユーザー
 *       → POST /api/deadlines が 11件目で 403 / FREE_LIMIT_EXCEEDED を返すこと
 *    c. subscriptions レコードなし（Free ユーザー）
 *       → POST /api/deadlines が 11件目で 403 / FREE_LIMIT_EXCEEDED を返すこと
 *
 * 2. Free 枠上限バナー（ダッシュボード）
 *    a. Free ユーザーでアイテム 10件の状態で /dashboard を表示
 *       → オレンジ色の「Free プランの上限（10件）に達しています」バナーが出ること
 *       → 「Pro にアップグレード」ボタンが /billing に遷移すること
 *    b. Free ユーザーでアイテム 9件以下 → バナーが出ないこと
 *    c. Pro ユーザーでアイテム 10件以上 → バナーが出ないこと
 *
 * 3. 作成フォームでの誘導（/deadline/new）
 *    a. Free ユーザーでアイテム 10件の状態で /deadline/new へ遷移し「作成する」を押す
 *       → フォーム上部にオレンジ色の「Pro にアップグレード →」ボタンが出ること
 *       → ボタンを押すと /billing に遷移すること
 *    b. Pro ユーザーは同状態でも正常に作成できること
 */

import assert from "node:assert/strict";
import { FREE_ITEM_LIMIT } from "../gate";

describe("Pro/Free ゲート", () => {
  it("FREE_ITEM_LIMIT が 10 である", () => {
    assert.equal(FREE_ITEM_LIMIT, 10);
  });

  it("FREE_ITEM_LIMIT が number 型である", () => {
    assert.equal(typeof FREE_ITEM_LIMIT, "number");
  });
});
