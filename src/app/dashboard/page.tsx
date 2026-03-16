import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import DeadlineList, { type DeadlineItem } from "./DeadlineList";

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

  // 2. ログインユーザーのアイテムを deadline_at 昇順で取得
  const rows = await prisma.deadlineItem.findMany({
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
  });

  // 3. Date → ISO string に変換（Client Component へのシリアライズ要件）
  const items: DeadlineItem[] = rows.map((row) => ({
    ...row,
    deadlineAt: row.deadlineAt.toISOString(),
  }));

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

      {/* 締切一覧（クライアントコンポーネント） */}
      <DeadlineList initialItems={items} />
    </main>
  );
}
