import { LP_CONTENT } from "./content";

/**
 * HowItWorksSection — 価値の流れを3ステップで示すセクション
 */
export function HowItWorksSection() {
  const { howItWorks } = LP_CONTENT;

  return (
    <section className="py-20" style={{ backgroundColor: "#f5f4ed" }}>
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className="text-center text-3xl font-medium"
          style={{
            color: "#141413",
            fontFamily: "Georgia, serif",
            lineHeight: 1.2,
          }}
        >
          {howItWorks.heading}
        </h2>
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {howItWorks.steps.map(({ number, label }) => (
            <div
              key={number}
              className="rounded-2xl p-6"
              style={{
                backgroundColor: "#faf9f5",
                border: "1px solid #f0eee6",
              }}
            >
              <div
                className="mb-4 text-3xl font-medium"
                style={{
                  color: "#c96442",
                  fontFamily: "Georgia, serif",
                }}
                aria-label={`ステップ ${number}`}
              >
                {number}
              </div>
              <p
                className="text-base leading-relaxed"
                style={{ color: "#4d4c48" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
