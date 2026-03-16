/**
 * POST /api/deadlines
 *
 * 締切アイテムを作成するAPI。
 *
 * 認証:
 *  - セッションクッキーが必要（未ログインは 401）
 *  - 作成者は必ずログインユーザー（他ユーザーへの書き込み不可）
 *
 * バリデーション（src/lib/deadlines/validate.ts 参照）:
 *  - company_name: 必須、1〜100 文字
 *  - kind: 必須、"es" | "briefing" | "interview" | "other"
 *  - deadline_at: 必須、ISO 8601 文字列
 *  - status: 任意、デフォルト "todo"
 *  - link: 任意、http(s) URL、最大 2048 文字
 *  - memo: 任意、最大 1000 文字
 *
 * Free 枠制限:
 *  - Pro ユーザー（subscriptions.plan = "pro" かつ active/trialing または current_period_end が未来）は無制限
 *  - それ以外（Free）は 10 件まで。超過時は 403 を返す
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { validateCreateDeadline } from "@/lib/deadlines/validate";

/** Free ユーザーが作成できる最大件数 */
export const FREE_ITEM_LIMIT = 10;

/**
 * subscriptions レコードを見て Pro か判定する。
 * Pro 判定: plan = "pro" かつ (status = "active" | "trialing" または current_period_end が未来)
 */
async function isProUser(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub || sub.plan !== "pro") return false;
  const activeStatus =
    sub.status === "active" || sub.status === "trialing";
  const periodValid =
    sub.currentPeriodEnd !== null && sub.currentPeriodEnd > new Date();
  return activeStatus || periodValid;
}

export async function POST(req: NextRequest) {
  try {
    // 1. 認証確認
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }
    const userId = session.sub;

    // 2. バリデーション
    const body = await req.json().catch(() => ({}));
    const result = validateCreateDeadline(body);
    if (!result.ok) {
      return NextResponse.json(
        { error: "入力値が不正です", details: result.errors },
        { status: 400 },
      );
    }
    const { companyName, kind, deadlineAt, status, link, memo } = result.data;

    // 3. Free 枠チェック
    const pro = await isProUser(userId);
    if (!pro) {
      const count = await prisma.deadlineItem.count({ where: { userId } });
      if (count >= FREE_ITEM_LIMIT) {
        return NextResponse.json(
          {
            error: `Free プランは最大 ${FREE_ITEM_LIMIT} 件まで登録できます。Pro にアップグレードすると無制限になります。`,
            code: "FREE_LIMIT_EXCEEDED",
          },
          { status: 403 },
        );
      }
    }

    // 4. 作成（userId を強制指定してユーザースコープを保証）
    const item = await prisma.deadlineItem.create({
      data: {
        userId,
        companyName,
        kind,
        deadlineAt,
        status,
        link,
        memo,
      },
    });

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/deadlines] unexpected error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
