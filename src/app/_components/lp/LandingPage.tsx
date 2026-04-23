import Image from "next/image";
import { LP_CONTENT } from "./content";
import { LpPageViewTracker } from "./LpPageViewTracker";
import { HeroSection } from "./HeroSection";
import { ProblemSection } from "./ProblemSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { BenefitSection } from "./BenefitSection";
import { DifferenceSection } from "./DifferenceSection";
import { BetaCtaSection } from "./BetaCtaSection";
import { LeadCaptureDialog } from "./LeadCaptureDialog";

/**
 * LP全体レイアウトを束ねる Server Component
 * デザイン方針: docs/DESIGN.md 参照（パーチメント系カラー + テラコッタCTA）
 */
export function LandingPage() {
  const { hero } = LP_CONTENT;

  return (
    // Canvas White (#ffffff) — Airbnb デザインシステム準拠
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      {/* ナビゲーション */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{
          borderColor: "#dddddd",
          backgroundColor: "#ffffff",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="〆トラ ロゴ"
              width={72}
              height={72}
              className="rounded-sm"
            />
            <span
              className="text-lg font-semibold"
              style={{ color: "#222222" }}
            >
              〆トラ
            </span>
          </div>
          <LeadCaptureDialog label={hero.ctaLabel} ctaLocation="hero" />
        </div>
      </header>

      {/* LP 表示イベント計測（UI なし） */}
      <LpPageViewTracker />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <BenefitSection />
        <DifferenceSection />
        <BetaCtaSection />
      </main>

      {/* フッター */}
      <footer
        className="border-t py-8 text-center text-sm"
        style={{ borderColor: "#dddddd", backgroundColor: "#f7f7f7", color: "#6a6a6a" }}
      >
        © 2026 〆トラ
      </footer>
    </div>
  );
}
