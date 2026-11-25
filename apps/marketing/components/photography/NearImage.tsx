'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * An image that only starts downloading when it's within `margin` of the viewport.
 * Native loading="lazy" fetches anything within ~1250–2500px on mobile, which pulled below-the-fold photos
 * into the page's first-paint window (Lighthouse LCP). A <noscript> copy keeps the real <img> in the HTML
 * for crawlers and no-JS visitors. Fades in once decoded.
 */
export function NearImage({
  src,
  alt,
  className = '',
  margin = '300px',
  placeholderClass = '',
}: {
  src: string;
  alt: string;
  className?: string;
  margin?: string;
  /** Classes applied until the image has loaded, e.g. 'aspect-[4/5]' to reserve space for an image of unknown size. */
  placeholderClass?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return (
    <>
      <img
        ref={ref}
        src={near ? src : undefined}
        alt={alt}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={loaded ? className : `${className} ${placeholderClass}`}
        // Inline (not a class) so it always wins over opacity utilities in `className`; also hides alt text before src is set.
        style={loaded ? undefined : { opacity: 0 }}
      />
      <noscript>
        <img src={src} alt={alt} className={className} />
      </noscript>
    </>
  );
}
