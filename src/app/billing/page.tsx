import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/session";
import { getUserPlan } from "@/features/deadlines/gate";
import { UpgradeButton } from "./UpgradeButton";
import { PortalButton } from "./PortalButton";

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const plan = await getUserPlan(session.sub);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">プランとお支払い</h1>

      {plan === "pro" && (
        <p className="mt-3 rounded bg-blue-50 px-4 py-2 text-sm text-blue-700">
          ✅ 現在 <strong>Pro</strong> プランをご利用中です。
        </p>
      )}

      {/* Free / Pro 比較テーブル */}
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-slate-600">機能</th>
              <th className="px-4 py-3 text-center text-slate-600">Free</th>
              <th className="px-4 py-3 text-center font-semibold text-blue-600">
                Pro（980円/月）
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-3 text-slate-700">締切アイテム登録数</td>
              <td className="px-4 py-3 text-center text-slate-500">最大 10 件</td>
              <td className="px-4 py-3 text-center font-medium text-blue-600">無制限</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-700">メール通知タイミング</td>
              <td className="px-4 py-3 text-center text-slate-500">24時間前のみ</td>
              <td className="px-4 py-3 text-center font-medium text-blue-600">
                72h / 24h / 3h 前
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-700">ダッシュボード</td>
              <td className="px-4 py-3 text-center text-slate-500">✅</td>
              <td className="px-4 py-3 text-center text-blue-600">✅</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div className="mt-8">
        {plan === "pro" ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              解約・支払い方法の変更は Stripe 管理画面からおこなえます。
            </p>
            <PortalButton />
          </div>
        ) : (
          <UpgradeButton />
        )}
      </div>
    </main>
  );
}
