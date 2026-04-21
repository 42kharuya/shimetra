/**
 * GtmScript — Google Tag Manager スクリプトを注入するコンポーネント
 *
 * ## GTM の仕組み（入門メモ）
 * GTM コンテナ ID（GTM-XXXXXXXX）を一つ埋め込むだけで、
 * GA4・Microsoft Clarity などの計測ツールを GTM 管理画面から追加できる。
 * コードを再deploy せずにタグを追加・変更できるのが GTM を使う最大の利点。
 *
 * ## なぜ <Script> を使うのか
 * Next.js の <Script strategy="afterInteractive"> を使うことで、
 * ページの描画をブロックせずに GTM スクリプトを読み込める。
 *
 * ## 環境変数
 * NEXT_PUBLIC_GTM_ID: GTM コンテナ ID（例: GTM-XXXXXXXX）
 *   - 未設定時はスクリプトを注入しない（開発環境での意図せぬ計測を防ぐ）
 *   - NEXT_PUBLIC_ プレフィックスはブラウザに公開するために必要
 */

import Script from "next/script";

export function GtmScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  // GTM ID が設定されていない場合は何も注入しない
  if (!gtmId) return null;

  return (
    <>
      {/*
       * GTM スクリプト本体
       * strategy="afterInteractive": ページの hydration 後に読み込む
       * これにより初期描画速度に影響しない
       */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');
          `.trim(),
        }}
      />
      {/*
       * GTM noscript フォールバック
       * JavaScript が無効な環境向け（iframe で計測を継続）
       * <body> の直後が理想だが、Next.js の制約上 layout.tsx の body 内先頭に置く
       */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
