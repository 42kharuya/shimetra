import type { Metadata } from "next";
import { LandingPage } from "@/app/_components/lp/LandingPage";

const TITLE = "〆トラ — 就活の迷いを、次の一手へ。";
const DESCRIPTION =
  "価値観や興味を整理しながら、あなたに合いそうな企業候補と次の一手を提案する就活支援サービス。現在は先行案内・検証段階です。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/lp",
  },
  openGraph: {
    type: "website",
    url: "/lp",
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

export default function LpPage() {
  return <LandingPage />;
}
