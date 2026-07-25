import Script from "next/script";

const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export function AdSenseScript({ nonce }: { nonce?: string }) {
  if (!client) {
    return null;
  }

  return (
    <Script
      async
      nonce={nonce}
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      strategy="afterInteractive"
    />
  );
}
