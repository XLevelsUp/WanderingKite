import React from 'react';
import { AfterInteraction } from '@/components/analytics/AfterInteraction';

export default function StudioSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Microsoft Clarity: session recordings & heatmaps, scoped to /studiospace.
  // Loads on the first interaction (or after 8s) so it doesn't compete with page load.
  const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID_STUDIO;

  return (
    <>
      {CLARITY_ID && (
        <AfterInteraction
          id="clarity-studiospace"
          code={`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        />
      )}
      {/* Dark studio theme for /studiospace and its blog — tokens in globals.css. */}
      <div data-theme="studio" className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </>
  );
}
