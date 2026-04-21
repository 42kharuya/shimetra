import { LP_CONTENT } from "./content";

/**
 * BenefitSection — 利用後の変化を具体化するセクション（ダーク背景）
 */
export function BenefitSection() {
  const { benefit } = LP_CONTENT;

  return (
    <section className="py-20" style={{ backgroundColor: "#30302e" }}>
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className="text-center text-3xl font-medium"
          style={{
            color: "#faf9f5",
            fontFamily: "Georgia, serif",
            lineHeight: 1.2,
          }}
        >
          {benefit.heading}
        </h2>
        <ul className="mx-auto mt-10 max-w-md space-y-5">
          {benefit.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-base leading-relaxed"
              style={{ color: "#b0aea5" }}
            >
              <span
                className="mt-0.5 flex-shrink-0"
                style={{ color: "#c96442" }}
                aria-hidden="true"
              >
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
