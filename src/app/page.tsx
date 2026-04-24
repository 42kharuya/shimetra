/**
 * 旧トップページ（締切管理サービス説明）
 * LP 検証フェーズ中はコメントアウト。
 * 戻すには以下のコメントアウトを外し、下の LP エクスポートを削除する。
 *
 * import Link from "next/link";
 * import { FREE_FEATURES, PRO_FEATURES } from "@/config/plans";
 *
 * export default function HomePage() {
 *   return (
 *     <div className="min-h-screen bg-white">
 *       <header className="border-b border-slate-100">
 *         <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
 *           <span className="text-lg font-bold text-slate-900">〆トラ</span>
 *           <Link href="/login" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
 *             ログイン / 無料登録
 *           </Link>
 *         </div>
 *       </header>
 *       <main>
 *         <section className="mx-auto max-w-4xl px-6 py-20 text-center">
 *           <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
 *             締切ミスを、もうしない。
 *           </h1>
 *           <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
 *             ES・説明会・面接の締切を一元管理し、<br />締切前にメールで通知。就活の出し忘れを防ぎます。
 *           </p>
 *           <div className="mt-10 flex justify-center gap-4">
 *             <Link href="/login" className="rounded-md bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-700">
 *               無料ではじめる
 *             </Link>
 *           </div>
 *           <p className="mt-4 text-sm text-slate-500">クレジットカード不要 · 10件まで無料</p>
 *         </section>
 *         <section className="bg-slate-50 py-16">
 *           <div className="mx-auto max-w-4xl px-6">
 *             <h2 className="text-center text-2xl font-bold text-slate-900">こんな経験、ありませんか？</h2>
 *             <ul className="mx-auto mt-8 max-w-md space-y-4 text-slate-700">
 *               {["気づいたら締切が過ぎていた","複数の企業の締切を覚えきれない","Notionに書いたけど更新が止まった"].map((item) => (
 *                 <li key={item} className="flex items-start gap-3">
 *                   <span className="mt-0.5 text-red-500">✕</span><span>{item}</span>
 *                 </li>
 *               ))}
 *             </ul>
 *           </div>
 *         </section>
 *         <section className="mx-auto max-w-4xl px-6 py-20">
 *           <h2 className="text-center text-2xl font-bold text-slate-900">シンプルな料金プラン</h2>
 *           <div className="mt-10 grid gap-6 sm:grid-cols-2">
 *             <div className="rounded-xl border border-slate-200 p-8">
 *               <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Free</p>
 *               <p className="mt-2 text-4xl font-bold text-slate-900">¥0</p>
 *               <p className="mt-1 text-sm text-slate-500">ずっと無料</p>
 *               <ul className="mt-6 space-y-3 text-sm text-slate-700">
 *                 {FREE_FEATURES.map((f) => (<li key={f} className="flex items-start gap-2"><span className="text-slate-400">✓</span><span>{f}</span></li>))}
 *               </ul>
 *               <Link href="/login" className="mt-8 block rounded-md border border-slate-900 px-4 py-2 text-center text-sm font-medium text-slate-900 hover:bg-slate-50">無料ではじめる</Link>
 *             </div>
 *             <div className="rounded-xl border-2 border-slate-900 bg-slate-900 p-8 text-white">
 *               <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Pro</p>
 *               <p className="mt-2 text-4xl font-bold">¥980</p>
 *               <p className="mt-1 text-sm text-slate-400">月額（税込）</p>
 *               <ul className="mt-6 space-y-3 text-sm text-slate-300">
 *                 {PRO_FEATURES.map((f) => (<li key={f} className="flex items-start gap-2"><span className="text-slate-400">✓</span><span>{f}</span></li>))}
 *               </ul>
 *               <Link href="/login" className="mt-8 block rounded-md bg-white px-4 py-2 text-center text-sm font-medium text-slate-900 hover:bg-slate-100">Pro ではじめる</Link>
 *             </div>
 *           </div>
 *         </section>
 *         <section className="bg-slate-50 py-20">
 *           <div className="mx-auto max-w-xl px-6 text-center">
 *             <h2 className="text-2xl font-bold text-slate-900">まず無料で試してみる</h2>
 *             <p className="mt-4 text-slate-600">登録はメールアドレスだけ。30秒ではじめられます。</p>
 *             <Link href="/login" className="mt-8 inline-block rounded-md bg-slate-900 px-8 py-3 text-base font-semibold text-white hover:bg-slate-700">無料登録はこちら</Link>
 *           </div>
 *         </section>
 *       </main>
 *       <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">© 2026 〆トラ</footer>
 *     </div>
 *   );
 * }
 */

// ── LP 検証フェーズ: / で新LP を表示する ────────────────────────────────────
// 旧サイトに戻すときは上のコメントアウトを解除してこれ以降を削除する。
import type { Metadata } from "next";
import { LandingPage } from "@/app/_components/lp/LandingPage";

const TITLE = "〆トラ — 就活の迷いを、次の一手へ。";
const DESCRIPTION =
  "価値観や興味を整理しながら、あなたに合いそうな企業候補と次の一手を提案する就活支援サービス。現在は先行案内・検証段階です。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "〆トラ",
    images: [
      {
        url: "/ogp-lp.png",
        width: 1200,
        height: 630,
        alt: "〆トラ — 就活の迷いを、次の一手へ。",
      },
    ],
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/ogp-lp.png"],
  },
};

export default function HomePage() {
  return <LandingPage />;
}
