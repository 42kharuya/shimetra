import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "〆トラ",
  description: "締切を登録して、締切前にメール通知で出し忘れを防ぐ就活管理サービス",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 bg-slate-50 py-4 text-center text-xs text-slate-500">
          <nav className="space-x-4">
            <Link href="/terms" className="hover:underline">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:underline">
              プライバシーポリシー
            </Link>
            <Link href="/legal" className="hover:underline">
              特定商取引法に基づく表記
            </Link>
            <a
              href="mailto:support@shimetra.com"
              className="hover:underline"
            >
              お問い合わせ
            </a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
