import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "就活締切トラッカー",
  description: "締切を登録して、締切前にメール通知で出し忘れを防ぐ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
