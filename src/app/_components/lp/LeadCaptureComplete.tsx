"use client";

/**
 * LeadCaptureComplete — 先行登録完了状態の表示
 * docs/LP.md § LeadCaptureComplete に準拠
 */

interface LeadCaptureCompleteProps {
  onClose: () => void;
}

export function LeadCaptureComplete({ onClose }: LeadCaptureCompleteProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2
        className="text-2xl font-medium"
        style={{ color: "#141413", fontFamily: "Georgia, serif", lineHeight: 1.2 }}
      >
        登録ありがとうございます
      </h2>
      <p className="text-base leading-relaxed" style={{ color: "#5e5d59" }}>
        〆トラは現在、先行案内・検証段階です。
        <br />
        今後、ベータ版やヒアリングのご案内を順次お送りします。
      </p>
      <p className="text-sm" style={{ color: "#87867f" }}>
        就活の悩みはご入力内容を参考に改善へ活用します。
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 rounded-lg px-8 py-3 text-sm font-medium transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#e8e6dc", color: "#4d4c48" }}
      >
        LPに戻る
      </button>
    </div>
  );
}
