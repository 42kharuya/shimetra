import { LP_CONTENT } from "./content";
import { LeadCaptureDialog } from "./LeadCaptureDialog";

/**
 * BetaCtaSection — 下部の登録導線セクション（ダーク背景）
 * CTA: 先行利用に登録する
 */
export function BetaCtaSection() {
  const { betaCta } = LP_CONTENT;

  return (
    <section
      className="py-24 text-center"
      style={{ backgroundColor: "#141413" }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className="text-3xl font-medium sm:text-4xl"
          style={{
            color: "#faf9f5",
            fontFamily: "Georgia, serif",
            lineHeight: 1.2,
          }}
        >
          {betaCta.heading}
        </h2>
        <p
          className="mx-auto mt-4 max-w-lg text-base leading-relaxed"
          style={{ color: "#b0aea5" }}
        >
          {betaCta.body}
        </p>
        <div className="mt-10">
          <LeadCaptureDialog label={betaCta.ctaLabel} ctaLocation="bottom" dark />
        </div>
        <p className="mt-4 text-sm" style={{ color: "#87867f" }}>
          {betaCta.note}
        </p>
      </div>
    </section>
  );
}
