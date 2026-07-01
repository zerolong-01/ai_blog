import Script from "next/script";

const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export function AdSenseScript() {
  if (!client) {
    return null;
  }

  return (
    <Script
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      strategy="afterInteractive"
    />
  );
}
