import React from 'react';
import { AfterInteraction } from '@/components/analytics/AfterInteraction';

const FB_PIXEL_ID = '1389714296598065';

export default function PhotographyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Microsoft Clarity: session recordings & heatmaps, scoped to /photography
  const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  // Both tags load on the visitor's first interaction (or after 8s) — see AfterInteraction — so their
  // JavaScript doesn't block the page while it loads. The <noscript> pixel still records no-JS visits.
  return (
    <>
      {CLARITY_ID && (
        <AfterInteraction
          id="clarity-photography"
          code={`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        />
      )}
      <AfterInteraction
        id="fb-pixel-photography"
        code={`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      />
      <noscript dangerouslySetInnerHTML={{ __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1" />` }} />
      {children}
    </>
  );
}
