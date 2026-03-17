import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import DeadlineList, { type DeadlineItem } from "./DeadlineList";
import { FREE_ITEM_LIMIT, isProUser } from "@/lib/deadlines/gate";
import { trackEvent } from "@/lib/analytics";

/**
 * /dashboard – Server Component
 *
 * - 未ログイン → /login にリダイレクト
 * - ログイン済 → Prisma で deadline_at 昇順取得し DeadlineList に渡す
 */
export default async function DashboardPage() {
  // 1. 認証確認（引数なし = Server Component 用パス）
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // 2. ダッシュボード表示の計測（重複は集計側で吸収する設計・エラーはキャッチ済みなのでawait可）
  await trackEvent({ name: "dashboard_viewed", userId: session.sub });

  // 3. ログインユーザーのアイテムを deadline_at 昇順で取得 & Pro 判定を並列実行
  const [rows, pro] = await Promise.all([
    prisma.deadlineItem.findMany({
      where: { userId: session.sub },
      orderBy: { deadlineAt: "asc" },
      select: {
        id: true,
        companyName: true,
        kind: true,
        deadlineAt: true,
        status: true,
        link: true,
        memo: true,
      },
    }),
    isProUser(session.sub),
  ]);

  // 4. Date → ISO string に変換（Client Component へのシリアライズ要件）
  const items: DeadlineItem[] = rows.map((row) => ({
    ...row,
    deadlineAt: row.deadlineAt.toISOString(),
  }));

  // Free ユーザーが上限に達しているか
  const isAtFreeLimit = !pro && items.length >= FREE_ITEM_LIMIT;

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">ダッシュボード</h1>
        <Link
          href="/deadline/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          + 締切を追加
        </Link>
      </div>

      {/* Free 枠上限バナー */}
      {isAtFreeLimit && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <p className="text-amber-800">
            <span className="font-semibold">Free プランの上限（{FREE_ITEM_LIMIT}件）に達しています。</span>
            {"　"}新しい締切を追加するには Pro へのアップグレードが必要です。
          </p>
          <Link
            href="/billing"
            className="ml-4 shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
          >
            Pro にアップグレード
          </Link>
        </div>
      )}

      {/* 締切一覧（クライアントコンポーネント） */}
      <DeadlineList initialItems={items} />
    </main>
  );
}
