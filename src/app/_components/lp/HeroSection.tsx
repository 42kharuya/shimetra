import Link from "next/link";
import { LP_CONTENT } from "./content";

/**
 * HeroSection — 誰向けの価値かを最初に伝えるセクション
 * CTA: 先行利用に登録する
 */
export function HeroSection() {
  const { hero } = LP_CONTENT;

  return (
    <section className="mx-auto max-w-5xl px-6 py-24 text-center">
      <h1
        className="mx-auto max-w-2xl text-4xl font-medium leading-tight sm:text-5xl"
        style={{
          color: "#141413",
          fontFamily: "Georgia, serif",
          lineHeight: 1.1,
        }}
      >
        {hero.heading}
      </h1>
      <p
        className="mx-auto mt-6 max-w-xl text-lg leading-relaxed"
        style={{ color: "#5e5d59" }}
      >
        {hero.subCopy}
      </p>
      <div className="mt-10">
        <Link
          href="/login"
          className="inline-block rounded-lg px-8 py-3.5 text-base font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#c96442", color: "#faf9f5" }}
        >
          {hero.ctaLabel}
        </Link>
      </div>
      <p className="mt-4 text-sm" style={{ color: "#87867f" }}>
        {hero.note}
      </p>
    </section>
  );
}
