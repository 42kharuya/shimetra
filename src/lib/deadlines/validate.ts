/**
 * Deadline Item 作成リクエストのバリデーション
 *
 * DB や外部依存を持たない純粋関数として切り出し、
 * ユニットテストが容易な設計にしている。
 */

const VALID_KINDS = ["es", "briefing", "interview", "other"] as const;
const VALID_STATUSES = ["todo", "submitted", "done", "canceled"] as const;

export type DeadlineKindValue = (typeof VALID_KINDS)[number];
export type DeadlineStatusValue = (typeof VALID_STATUSES)[number];

/** バリデーション済みの正規化済み入力値 */
export interface NormalizedDeadlineInput {
  companyName: string;
  kind: DeadlineKindValue;
  deadlineAt: Date;
  status: DeadlineStatusValue;
  link: string | null;
  memo: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type ValidateResult =
  | { ok: true; data: NormalizedDeadlineInput }
  | { ok: false; errors: ValidationError[] };

/**
 * POST /api/deadlines のリクエストボディを検証して正規化する。
 *
 * ルール:
 *  - company_name: 必須、1〜100文字
 *  - kind: 必須、"es" | "briefing" | "interview" | "other"
 *  - deadline_at: 必須、ISO 8601 文字列（有効な日時）
 *  - status: 任意、デフォルト "todo"、"todo" | "submitted" | "done" | "canceled"
 *  - link: 任意、http(s) URL、最大 2048 文字
 *  - memo: 任意、最大 1000 文字
 */
export function validateCreateDeadline(body: unknown): ValidateResult {
  const errors: ValidationError[] = [];

  if (typeof body !== "object" || body === null) {
    return {
      ok: false,
      errors: [{ field: "_body", message: "リクエストボディが不正です" }],
    };
  }
  const b = body as Record<string, unknown>;

  // company_name
  const companyName =
    typeof b.company_name === "string" ? b.company_name.trim() : "";
  if (!companyName) {
    errors.push({ field: "company_name", message: "企業名は必須です" });
  } else if (companyName.length > 100) {
    errors.push({
      field: "company_name",
      message: "企業名は100文字以内で入力してください",
    });
  }

  // kind
  const rawKind = typeof b.kind === "string" ? b.kind.trim() : "";
  if (!rawKind) {
    errors.push({ field: "kind", message: "種別は必須です" });
  } else if (!(VALID_KINDS as readonly string[]).includes(rawKind)) {
    errors.push({
      field: "kind",
      message: `種別は ${VALID_KINDS.join(" / ")} のいずれかを指定してください`,
    });
  }

  // deadline_at
  const rawDeadline =
    typeof b.deadline_at === "string" ? b.deadline_at.trim() : "";
  let deadlineAt: Date | null = null;
  if (!rawDeadline) {
    errors.push({ field: "deadline_at", message: "締切日時は必須です" });
  } else {
    const d = new Date(rawDeadline);
    if (isNaN(d.getTime())) {
      errors.push({
        field: "deadline_at",
        message: "締切日時は有効な ISO 8601 形式で入力してください",
      });
    } else {
      deadlineAt = d;
    }
  }

  // status（任意、デフォルト "todo"）
  const rawStatus =
    typeof b.status === "string" ? b.status.trim() : "todo";
  const status: DeadlineStatusValue =
    (VALID_STATUSES as readonly string[]).includes(rawStatus)
      ? (rawStatus as DeadlineStatusValue)
      : "todo";
  if (
    typeof b.status === "string" &&
    !(VALID_STATUSES as readonly string[]).includes(b.status.trim())
  ) {
    errors.push({
      field: "status",
      message: `ステータスは ${VALID_STATUSES.join(" / ")} のいずれかを指定してください`,
    });
  }

  // link（任意）
  let link: string | null = null;
  if (b.link !== undefined && b.link !== null && b.link !== "") {
    const rawLink = typeof b.link === "string" ? b.link.trim() : "";
    if (!rawLink) {
      link = null;
    } else if (rawLink.length > 2048) {
      errors.push({
        field: "link",
        message: "リンクは2048文字以内で入力してください",
      });
    } else if (!/^https?:\/\/.+/.test(rawLink)) {
      errors.push({
        field: "link",
        message: "リンクは http:// または https:// で始まる URL を入力してください",
      });
    } else {
      link = rawLink;
    }
  }

  // memo（任意）
  let memo: string | null = null;
  if (b.memo !== undefined && b.memo !== null && b.memo !== "") {
    const rawMemo = typeof b.memo === "string" ? b.memo.trim() : "";
    if (rawMemo.length > 1000) {
      errors.push({
        field: "memo",
        message: "メモは1000文字以内で入力してください",
      });
    } else {
      memo = rawMemo || null;
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      companyName,
      kind: rawKind as DeadlineKindValue,
      deadlineAt: deadlineAt!,
      status,
      link,
      memo,
    },
  };
}
