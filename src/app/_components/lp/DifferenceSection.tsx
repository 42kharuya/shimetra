import { LP_CONTENT } from "./content";

/**
 * DifferenceSection — 既存手段との違いと価値ループを示すセクション
 */
export function DifferenceSection() {
  const { difference } = LP_CONTENT;

  return (
    <section className="py-20" style={{ backgroundColor: "#f5f4ed" }}>
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2
          className="text-3xl font-medium"
          style={{
            color: "#141413",
            fontFamily: "Georgia, serif",
            lineHeight: 1.2,
          }}
        >
          {difference.heading}
        </h2>
        <p
          className="mx-auto mt-4 max-w-lg text-base leading-relaxed"
          style={{ color: "#5e5d59" }}
        >
          {difference.body}
        </p>
        {/* 価値ループ */}
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
          aria-label="価値ループ"
        >
          {difference.loop.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                style={{
                  backgroundColor: "#faf9f5",
                  border: "1px solid #e8e6dc",
                  color: "#4d4c48",
                }}
              >
                {step}
              </span>
              {i < difference.loop.length - 1 && (
                <span style={{ color: "#c96442" }} aria-hidden="true">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
