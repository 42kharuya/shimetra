/**
 * POST /api/waitlist
 *
 * LP先行登録エンドポイント
 *
 * 認証: 不要（公開エンドポイント）
 *
 * リクエストボディ:
 *  - email          : string（必須）
 *  - graduationYear : number（必須、4桁）
 *  - concerns       : string | undefined（任意）
 *  - hearingOptIn   : boolean | undefined（任意）
 *
 * レスポンス:
 *  - { ok: true }          200
 *  - { error: string }     400 / 409 / 500
 *
 * 制約:
 *  - メールアドレスの重複は 409 を返す
 *  - バリデーション失敗は 400 を返す
 *  - メールアドレスは計測イベントに含めない
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENT_YEAR = new Date().getFullYear();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const { email, graduationYear, concerns, hearingOptIn } = body as {
      email?: unknown;
      graduationYear?: unknown;
      concerns?: unknown;
      hearingOptIn?: unknown;
    };

    // ── バリデーション ─────────────────────────────────────────────────
    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "メールアドレスを正しく入力してください" },
        { status: 400 },
      );
    }

    const year = Number(graduationYear);
    if (!Number.isInteger(year) || year < CURRENT_YEAR || year > CURRENT_YEAR + 10) {
      return NextResponse.json(
        { error: "卒業年度を正しく選択してください" },
        { status: 400 },
      );
    }

    if (concerns !== undefined && typeof concerns !== "string") {
      return NextResponse.json({ error: "入力値が不正です" }, { status: 400 });
    }

    if (hearingOptIn !== undefined && typeof hearingOptIn !== "boolean") {
      return NextResponse.json({ error: "入力値が不正です" }, { status: 400 });
    }

    // ── 保存 ─────────────────────────────────────────────────────────
    await prisma.waitlistEntry.create({
      data: {
        email: email.trim().toLowerCase(),
        graduationYear: year,
        concerns: typeof concerns === "string" && concerns.trim() ? concerns.trim() : null,
        hearingOptIn: typeof hearingOptIn === "boolean" ? hearingOptIn : null,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    // Prisma unique constraint violation
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "このメールアドレスはすでに登録されています" },
        { status: 409 },
      );
    }

    console.error("[waitlist] unexpected error", err);
    return NextResponse.json(
      { error: "送信に失敗しました。しばらく後にお試しください" },
      { status: 500 },
    );
  }
}
