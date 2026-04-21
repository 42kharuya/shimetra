import Link from "next/link";
import { LP_CONTENT } from "./content";
import { HeroSection } from "./HeroSection";
import { ProblemSection } from "./ProblemSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { BenefitSection } from "./BenefitSection";
import { DifferenceSection } from "./DifferenceSection";
import { BetaCtaSection } from "./BetaCtaSection";

/**
 * LP全体レイアウトを束ねる Server Component
 * デザイン方針: docs/DESIGN.md 参照（パーチメント系カラー + テラコッタCTA）
 */
export function LandingPage() {
  const { hero } = LP_CONTENT;

  return (
    // パーチメント背景 (#f5f4ed)
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4ed" }}>
      {/* ナビゲーション */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{
          borderColor: "#f0eee6",
          backgroundColor: "#f5f4ed",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span
            className="text-lg font-medium"
            style={{ color: "#141413", fontFamily: "Georgia, serif" }}
          >
            〆トラ
          </span>
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#c96442", color: "#faf9f5" }}
          >
            {hero.ctaLabel}
          </Link>
        </div>
      </header>

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
        style={{ borderColor: "#30302e", backgroundColor: "#141413", color: "#5e5d59" }}
      >
        © 2026 〆トラ
      </footer>
    </div>
  );
}
