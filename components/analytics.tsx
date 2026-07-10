import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  return (
    <>
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-script" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      ) : null}
      <VercelAnalytics />
    </>
  );
}
