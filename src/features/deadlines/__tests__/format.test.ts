/**
 * src/lib/deadlines/format.ts ユニットテスト
 *
 * テスト対象: formatDeadline / getUrgencyLevel（純粋関数・DB不要）
 * ダッシュボードUI の表示ロジックを担保する最小テスト。
 */
import assert from "node:assert/strict";
import { formatDeadline, getUrgencyLevel } from "../format";

// テスト基準日: 2026-04-10 12:00:00 JST
const NOW = new Date("2026-04-10T03:00:00.000Z"); // UTC = JST - 9h

describe("format.ts", () => {
  // ── formatDeadline ──────────────────────────────────────────────────────


  it("期限切れ: 過去の日時は「期限切れ」を含む", () => {
    const past = "2026-04-09T03:00:00.000Z"; // 1日前
    assert.ok(
      formatDeadline(past, NOW).includes("期限切れ"),
      `got: ${formatDeadline(past, NOW)}`,
    );
  });

  it("今日: 同日のうちに切れるなら「今日」を含む", () => {
    const today = "2026-04-10T10:00:00.000Z"; // 約7h後
    assert.ok(
      formatDeadline(today, NOW).includes("今日"),
      `got: ${formatDeadline(today, NOW)}`,
    );
  });

  it("明日: 翌日締切なら「明日」を含む", () => {
    const tomorrow = "2026-04-11T03:00:00.000Z"; // ちょうど24h後
    assert.ok(
      formatDeadline(tomorrow, NOW).includes("明日"),
      `got: ${formatDeadline(tomorrow, NOW)}`,
    );
  });

  it("N日後: 3日後なら「3日後」を含む", () => {
    const threeDays = "2026-04-13T03:00:00.000Z";
    assert.ok(
      formatDeadline(threeDays, NOW).includes("3日後"),
      `got: ${formatDeadline(threeDays, NOW)}`,
    );
  });

  // ── getUrgencyLevel ─────────────────────────────────────────────────────


  it("overdue: 過去日時", () => {
    const past = "2026-04-09T03:00:00.000Z";
    assert.equal(getUrgencyLevel(past, NOW), "overdue");
  });

  it("today: 24h 以内", () => {
    const soonIsh = "2026-04-10T10:00:00.000Z"; // 約7h後
    assert.equal(getUrgencyLevel(soonIsh, NOW), "today");
  });

  it("soon: 3日以内（25h後）", () => {
    const dayAfter = "2026-04-11T04:30:00.000Z"; // 約25.5h後
    assert.equal(getUrgencyLevel(dayAfter, NOW), "soon");
  });

  it("normal: 4日後", () => {
    const far = "2026-04-14T03:00:00.000Z";
    assert.equal(getUrgencyLevel(far, NOW), "normal");
  });

});
