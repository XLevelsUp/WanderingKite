import React from 'react';
import Script from 'next/script';

export default function PhotographyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Microsoft Clarity: session recordings & heatmaps, scoped to /photography
  const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  return (
    <>
      {CLARITY_ID && (
        <Script id="microsoft-clarity-photography" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      )}
      <Script id="fb-pixel-photography" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1389714296598065');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript dangerouslySetInnerHTML={{ __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1389714296598065&ev=PageView&noscript=1" />` }} />
      {children}
    </>
  );
}
