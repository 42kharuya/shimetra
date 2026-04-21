import { LP_CONTENT } from "./content";

/**
 * ProblemSection — 課題共感を作るセクション（ダーク背景）
 */
export function ProblemSection() {
  const { problem } = LP_CONTENT;

  return (
    <section className="py-20" style={{ backgroundColor: "#141413" }}>
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className="text-center text-3xl font-medium"
          style={{
            color: "#faf9f5",
            fontFamily: "Georgia, serif",
            lineHeight: 1.2,
          }}
        >
          {problem.heading}
        </h2>
        <ul className="mx-auto mt-10 max-w-lg space-y-5">
          {problem.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-base leading-relaxed"
              style={{ color: "#b0aea5" }}
            >
              <span
                className="mt-0.5 flex-shrink-0 text-sm"
                style={{ color: "#c96442" }}
                aria-hidden="true"
              >
                ✕
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
