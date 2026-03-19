import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | 〆トラ",
};

const ITEMS: { label: string; value: React.ReactNode }[] = [
  { label: "販売業者", value: "川﨑　遥也" },
  {
    label: "所在地",
    value: "請求があれば遅滞なく開示いたします",
  },
  {
    label: "連絡先",
    value: (
      <a
        href="mailto:haruya.0411.k@gmail.com"
        className="text-blue-600 hover:underline"
      >
        haruya.0411.k@gmail.com
      </a>
    ),
  },
  {
    label: "販売価格",
    value: "Proプラン：980円（税込）/ 月",
  },
  {
    label: "支払方法",
    value: "クレジットカード（Visa・Mastercard・American Express・JCB 等）",
  },
  {
    label: "支払時期",
    value:
      "お申し込み完了時に初回課金が発生し、以降は毎月同日に自動更新されます。",
  },
  {
    label: "サービス提供時期",
    value: "決済完了後、即時にご利用いただけます。",
  },
  {
    label: "返品・キャンセルについて",
    value:
      "デジタルコンテンツの性質上、原則として返金はお受けできません。サブスクリプションはいつでもキャンセル可能です。キャンセル後は現在の契約期間終了までサービスをご利用いただけます。",
  },
  {
    label: "動作環境",
    value:
      "最新バージョンの Google Chrome・Safari・Firefox・Edge を推奨します。",
  },
];

export default function LegalPage() {
  const updatedAt = "2026年3月19日";

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed text-slate-700">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        特定商取引法に基づく表記
      </h1>
      <p className="mb-8 text-xs text-slate-500">最終更新: {updatedAt}</p>

      <table className="w-full border-collapse text-sm">
        <tbody>
          {ITEMS.map(({ label, value }) => (
            <tr key={label} className="border-t border-slate-200">
              <th className="w-36 py-4 pr-4 text-left align-top font-semibold text-slate-900">
                {label}
              </th>
              <td className="py-4 text-slate-700">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10 text-xs text-slate-400">
        <Link href="/" className="hover:underline">
          ← トップへ戻る
        </Link>
      </div>
    </main>
  );
}
