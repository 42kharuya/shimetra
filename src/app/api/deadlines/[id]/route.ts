/**
 * PATCH /api/deadlines/:id
 *
 * 締切アイテムを部分更新するAPI。
 *
 * 認証:
 *  - セッションクッキーが必要（未ログインは 401）
 *  - 対象アイテムの所有者のみ更新可（他ユーザーは 403）
 *
 * バリデーション（src/lib/deadlines/validate.ts 参照）:
 *  - 少なくとも 1 フィールドが必要
 *  - 各フィールドは validateUpdateDeadline で検証
 *
 * status_changed_at:
 *  - status を "submitted" にした時だけ現在時刻を設定する
 *  - その他の status 変更では status_changed_at は変更しない
 *
 * ----
 *
 * DELETE /api/deadlines/:id
 *
 * 締切アイテムを削除するAPI。
 *
 * 認証:
 *  - セッションクッキーが必要（未ログインは 401）
 *  - 対象アイテムの所有者のみ削除可（他ユーザーは 403）
 */

export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { prisma } from "@/lib/prisma";
import { validateUpdateDeadline } from "@/features/deadlines/validate";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
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
    const { id } = await params;

    // 2. バリデーション
    const body = await req.json().catch(() => ({}));
    const result = validateUpdateDeadline(body);
    if (!result.ok) {
      return NextResponse.json(
        { error: "入力値が不正です", details: result.errors },
        { status: 400 },
      );
    }
    const { companyName, kind, deadlineAt, status, link, memo } = result.data;

    // 3. ユーザースコープ確認
    const existing = await prisma.deadlineItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "見つかりません" },
        { status: 404 },
      );
    }
    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "権限がありません" },
        { status: 403 },
      );
    }

    // 4. statusChangedAt: status を "submitted" にした時だけ設定
    const statusChangedAt = status === "submitted" ? new Date() : undefined;

    // 5. 更新（undefined のフィールドはスキップ）
    const item = await prisma.deadlineItem.update({
      where: { id },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(kind !== undefined && { kind }),
        ...(deadlineAt !== undefined && { deadlineAt }),
        ...(status !== undefined && { status }),
        ...(statusChangedAt !== undefined && { statusChangedAt }),
        ...(link !== undefined && { link }),
        ...(memo !== undefined && { memo }),
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[PATCH /api/deadlines/:id] unexpected error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
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
    const { id } = await params;

    // 2. ユーザースコープ確認
    const existing = await prisma.deadlineItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "見つかりません" },
        { status: 404 },
      );
    }
    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "権限がありません" },
        { status: 403 },
      );
    }

    // 3. 削除
    await prisma.deadlineItem.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/deadlines/:id] unexpected error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
