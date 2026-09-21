import Script from "next/script";

export default function ConsoleApiAnalytics() {
  const siteId = process.env.NEXT_PUBLIC_CONSOLEAPI_SITE_ID;

  if (!siteId) {
    return null;
  }

  return (
    <Script
      id="consoleapi-analytics-sdk"
      src="https://analytics.consoleapi.in/sdk/analytics.js"
      data-site-id={siteId}
      strategy="afterInteractive"
    />
  );
}
