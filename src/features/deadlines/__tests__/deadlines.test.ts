/**
 * Deadline Item バリデーション ユニットテスト
 *
 * テスト戦略:
 *  - validateCreateDeadline / validateUpdateDeadline: DB不要な純粋関数のみ対象
 *  - Free枠制限・DB保存・認証はRoute Handler経由の手動確認手順を参照
 *  - GET /api/deadlines: 純粋関数なし。手動確認手順（下記）で一覧取得・順序を検証する
 *    1. ログイン済みで GET /api/deadlines → 自ユーザーのアイテムが deadline_at 昇順で返る
 *    2. 未ログインで GET /api/deadlines → 401 が返る
 *    3. 別ユーザーのアイテムが混入しないことを複数ユーザーで確認
 *  - PATCH /DELETEE /api/deadlines/:id: 手動確認手順を参照
 */

import assert from "node:assert/strict";
import { validateCreateDeadline, validateUpdateDeadline } from "../validate";

const VALID_BASE = {
  company_name: "株式会社テスト",
  kind: "es",
  deadline_at: "2026-04-01T10:00:00+09:00",
};

describe("Deadline バリデーション", () => {
  // ── 正常系 ──────────────────────────────────────────────────────────────

  it("最小必須フィールドのみで ok:true を返す", () => {
    const r = validateCreateDeadline(VALID_BASE);
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal(r.data.companyName, "株式会社テスト");
    assert.equal(r.data.kind, "es");
    assert.equal(r.data.status, "todo"); // デフォルト
    assert.equal(r.data.link, null);
    assert.equal(r.data.memo, null);
  });

  it("status を明示指定できる", () => {
    const r = validateCreateDeadline({ ...VALID_BASE, status: "submitted" });
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal(r.data.status, "submitted");
  });

  it("link と memo を指定できる", () => {
    const r = validateCreateDeadline({
      ...VALID_BASE,
      link: "https://example.com/job",
      memo: "ES締切注意",
    });
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal(r.data.link, "https://example.com/job");
    assert.equal(r.data.memo, "ES締切注意");
  });

  it("kind が interview / briefing / other も受け付ける", () => {
    for (const kind of ["interview", "briefing", "other"]) {
      const r = validateCreateDeadline({ ...VALID_BASE, kind });
      assert.ok(r.ok, `kind=${kind} が ok:false になった`);
    }
  });

  it("deadline_at が Date オブジェクトに変換される", () => {
    const r = validateCreateDeadline({
      ...VALID_BASE,
      deadline_at: "2026-06-15T09:00:00Z",
    });
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.ok(r.data.deadlineAt instanceof Date);
  });

  it("link/memo が空文字の場合は null に正規化される", () => {
    const r = validateCreateDeadline({
      ...VALID_BASE,
      link: "",
      memo: "",
    });
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal(r.data.link, null);
    assert.equal(r.data.memo, null);
  });

  // ── 異常系 ──────────────────────────────────────────────────────────────

  it("company_name が空なら errors に含まれる", () => {
    const r = validateCreateDeadline({ ...VALID_BASE, company_name: "" });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "company_name"));
  });

  it("company_name が 101 文字超でエラー", () => {
    const r = validateCreateDeadline({
      ...VALID_BASE,
      company_name: "あ".repeat(101),
    });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "company_name"));
  });

  it("kind が不正値ならエラー", () => {
    const r = validateCreateDeadline({ ...VALID_BASE, kind: "unknown" });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "kind"));
  });

  it("deadline_at が欠落ならエラー", () => {
    const { deadline_at: _, ...rest } = VALID_BASE;
    const r = validateCreateDeadline(rest);
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "deadline_at"));
  });

  it("deadline_at が不正な文字列ならエラー", () => {
    const r = validateCreateDeadline({
      ...VALID_BASE,
      deadline_at: "not-a-date",
    });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "deadline_at"));
  });

  it("link が http(s) 以外ならエラー", () => {
    const r = validateCreateDeadline({
      ...VALID_BASE,
      link: "ftp://example.com",
    });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "link"));
  });

  it("link が 2049 文字超ならエラー", () => {
    const r = validateCreateDeadline({
      ...VALID_BASE,
      link: "https://example.com/" + "a".repeat(2030),
    });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "link"));
  });

  it("memo が 1001 文字超ならエラー", () => {
    const r = validateCreateDeadline({
      ...VALID_BASE,
      memo: "あ".repeat(1001),
    });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "memo"));
  });

  it("body が非オブジェクトならエラー", () => {
    const r = validateCreateDeadline("invalid");
    assert.ok(!r.ok);
  });

  it("複数フィールドが不正なら errors に複数エントリが返る", () => {
    const r = validateCreateDeadline({
      company_name: "",
      kind: "bad",
      deadline_at: "",
    });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.length >= 3);
  });

  // ────────────────────────────────────────────────────────────────────
  // validateUpdateDeadline テスト
  // ────────────────────────────────────────────────────────────────────

  it("status だけ指定して ok:true を返す", () => {
    const r = validateUpdateDeadline({ status: "submitted" });
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal(r.data.status, "submitted");
  });

  it("status = submitted が正しく返る", () => {
    for (const s of ["todo", "submitted", "done", "canceled"]) {
      const r = validateUpdateDeadline({ status: s });
      assert.ok(r.ok, `status=${s} が ok:false になった`);
    }
  });

  it("company_name だけ指定して ok:true を返す", () => {
    const r = validateUpdateDeadline({ company_name: "新会社名" });
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal(r.data.companyName, "新会社名");
  });

  it("link を null で指定すると data.link が null になる", () => {
    const r = validateUpdateDeadline({ status: "todo", link: null });
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal(r.data.link, null);
  });

  it("memo を null で指定すると data.memo が null になる", () => {
    const r = validateUpdateDeadline({ status: "done", memo: null });
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal(r.data.memo, null);
  });

  it("フィールドを 1 つも指定しないとエラー", () => {
    const r = validateUpdateDeadline({});
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "_body"));
  });

  it("body が非オブジェクトならエラー（update）", () => {
    const r = validateUpdateDeadline(null);
    assert.ok(!r.ok);
  });

  it("status が不正値ならエラー（update）", () => {
    const r = validateUpdateDeadline({ status: "invalid" });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "status"));
  });

  it("company_name が空文字ならエラー（update）", () => {
    const r = validateUpdateDeadline({ company_name: "" });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "company_name"));
  });

  it("company_name が 101 文字超ならエラー（update）", () => {
    const r = validateUpdateDeadline({ company_name: "あ".repeat(101) });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "company_name"));
  });

  it("link が http(s) 以外ならエラー（update）", () => {
    const r = validateUpdateDeadline({ link: "ftp://example.com" });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "link"));
  });

  it("deadline_at が不正な文字列ならエラー（update）", () => {
    const r = validateUpdateDeadline({ deadline_at: "not-a-date" });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "deadline_at"));
  });

  it("memo が 1001 文字超ならエラー（update）", () => {
    const r = validateUpdateDeadline({ memo: "あ".repeat(1001) });
    assert.ok(!r.ok);
    if (r.ok) return;
    assert.ok(r.errors.some((e) => e.field === "memo"));
  });

});
