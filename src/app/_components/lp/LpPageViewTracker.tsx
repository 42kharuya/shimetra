"use client";

/**
 * LpPageViewTracker — LP 表示時に lp_viewed イベントを発火する
 *
 * ## なぜこのコンポーネントが必要か
 * Next.js の Server Component 内では window オブジェクトにアクセスできない。
 * dataLayer.push() はブラウザ上の操作なので、"use client" の
 * Client Component として切り出す必要がある。
 *
 * ## lp_viewed イベントについて（docs/LP.md より）
 * - 発火タイミング: LP 表示完了時に 1 回
 * - 送るパラメータ: page_type, page_path, page_title, device_type
 * - SPA 再描画での重複送信を防ぐため useEffect の依存配列は [] にする
 *
 * ## GTM との関係
 * このコンポーネントは dataLayer.push() を呼ぶだけ。
 * 「GA4 にどう送るか」は GTM 管理画面のトリガー/タグ設定に任せる。
 */

import { useEffect } from "react";

export function LpPageViewTracker() {
  useEffect(() => {
    const win = window as Window & { dataLayer?: unknown[] };
    win.dataLayer = win.dataLayer ?? [];
    win.dataLayer.push({
      event: "lp_viewed",
      page_type: "lp",
      page_path: window.location.pathname,
      page_title: document.title,
      // "mobile" / "tablet" / "desktop" を幅で判断
      device_type:
        window.innerWidth < 768
          ? "mobile"
          : window.innerWidth < 1024
            ? "tablet"
            : "desktop",
    });
  }, []); // マウント時に 1 回だけ発火

  // UI を持たない計測専用コンポーネントのため null を返す
  return null;
}
