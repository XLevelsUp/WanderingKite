'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Play, Film, AlertCircle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface InstagramMediaItem {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string;
  permalink: string;
}

interface InstagramFeedProps {
  account?: string;
}

const FALLBACK_ITEMS: InstagramMediaItem[] = [
  {
    id: 'fallback-1',
    media_type: 'IMAGE',
    media_url: '/images/studio/placeholder1.webp',
    thumbnail_url: '/images/studio/placeholder1.webp',
    permalink: 'https://instagram.com/wanderingkitestudio'
  },
  {
    id: 'fallback-2',
    media_type: 'IMAGE',
    media_url: '/images/studio/placeholder2.webp',
    thumbnail_url: '/images/studio/placeholder2.webp',
    permalink: 'https://instagram.com/wanderingkitestudio'
  },
  {
    id: 'fallback-3',
    media_type: 'IMAGE',
    media_url: '/images/studio/placeholder3.webp',
    thumbnail_url: '/images/studio/placeholder3.webp',
    permalink: 'https://instagram.com/wanderingkitestudio'
  },
  {
    id: 'fallback-4',
    media_type: 'IMAGE',
    media_url: '/images/studio/placeholder4.webp',
    thumbnail_url: '/images/studio/placeholder4.webp',
    permalink: 'https://instagram.com/wanderingkitestudio'
  },
  {
    id: 'fallback-5',
    media_type: 'IMAGE',
    media_url: '/images/studio/placeholder5.webp',
    thumbnail_url: '/images/studio/placeholder5.webp',
    permalink: 'https://instagram.com/wanderingkitestudio'
  }
];

export function InstagramFeed({ account = 'wanderingkite' }: InstagramFeedProps) {
  const [media, setMedia] = useState<InstagramMediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackActive, setIsFallbackActive] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Separate refs for desktop/tablet vs mobile to avoid collision
  const desktopVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchFeed() {
      try {
        setLoading(true);
        const res = await fetch(`/api/instagram?account=${account}`);
        if (!res.ok) {
          throw new Error('Failed to fetch Instagram media items.');
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setMedia(json.data);
          setIsFallbackActive(false);
        } else {
          throw new Error(json.error || 'Invalid API response format.');
        }
      } catch (err: any) {
        logger.warn('Error loading live Instagram feed (gracefully hiding feed section):', err);
        setError('Failed to load feed');
        setMedia([]);
        setIsFallbackActive(false);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, [account]);

  // Desktop hover controls for videos (ignores the first video which autoplays in the center)
  const handleDesktopMouseEnter = (item: InstagramMediaItem, visualIdx: number) => {
    if (media.length > 0 && item.id === media[0].id) return; // The first video autoplays, ignore
    const video = desktopVideoRefs.current[visualIdx];
    if (video) {
      video.play().catch((err) => logger.debug('Hover playback error:', err));
    }
  };

  const handleDesktopMouseLeave = (item: InstagramMediaItem, visualIdx: number) => {
    if (media.length > 0 && item.id === media[0].id) return; // The first video autoplays, ignore
    const video = desktopVideoRefs.current[visualIdx];
    if (video) {
      video.pause();
      video.currentTime = 0; // Rewind for fresh starts
    }
  };

  // Mobile carousel scroll tracker
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.clientWidth;
    const newIndex = Math.round(scrollLeft / itemWidth);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < media.length) {
      setActiveIndex(newIndex);
    }
  };

  // Mobile scroll-to-index handler
  const scrollToSlide = (idx: number) => {
    const container = carouselRef.current;
    if (container) {
      container.scrollTo({
        left: idx * container.clientWidth,
        behavior: 'smooth',
      });
      setActiveIndex(idx);
    }
  };

  // Mobile: Autoplay ONLY the currently active slide's video, pause others
  useEffect(() => {
    if (media.length === 0) return;

    mobileVideoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === activeIndex) {
        if (video.paused && video.getAttribute('data-is-video') === 'true') {
          video.play().catch(() => {});
        }
      } else {
        if (!video.paused) {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [activeIndex, media]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="w-full">
        {/* Desktop/Tablet Skeleton */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-[30px]">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-card/50 border border-border/40 rounded-2xl overflow-hidden aspect-[9/16] relative animate-pulse"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              <div className="absolute bottom-4 left-4 h-4 w-2/3 bg-muted rounded-md" />
            </div>
          ))}
        </div>

        {/* Mobile Skeleton */}
        <div className="block md:hidden flex flex-col items-center">
          <div className="w-full bg-card/50 border border-border/40 rounded-2xl overflow-hidden aspect-[9/16] relative animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>
          <div className="flex gap-2 mt-4 justify-center">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-2 w-2 rounded-full bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Graceful Error State (completely hides the section if the feed fails to load)
  if (error || media.length === 0) {
    return null;
  }

  // Rearrange media items for the desktop 5-column grid view so that the first video (index 0) is in the center:
  // Visual position 0 -> media[3]
  // Visual position 1 -> media[1]
  // Visual position 2 -> media[0] (center)
  // Visual position 3 -> media[2]
  // Visual position 4 -> media[4]
  const gridMedia = media.length === 5
    ? [media[3], media[1], media[0], media[2], media[4]]
    : media;

  return (
    <div className="w-full">
      {/* DESKTOP/TABLET GRID VIEW (hidden on mobile) */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-5">
        {gridMedia.map((item, visualIdx) => {
          const isVideo = item.media_type === 'VIDEO';
          const isFirstVideo = item.id === media[0].id;

          return (
            <a
              key={item.id}
              href={item.permalink}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => handleDesktopMouseEnter(item, visualIdx)}
              onMouseLeave={() => handleDesktopMouseLeave(item, visualIdx)}
              className="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-black transition-all duration-300 hover:scale-[1.02] hover:z-10"
              style={{
                boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
              }}
            >
              {/* Subtle white border highlight on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl ring-0 group-hover:ring-1 group-hover:ring-white/20 transition-all duration-300 z-20"
              />

              {/* Media layer */}
              {isVideo ? (
                <>
                  <video
                    ref={(el) => { desktopVideoRefs.current[visualIdx] = el; }}
                    src={item.media_url}
                    poster={item.thumbnail_url}
                    autoPlay={isFirstVideo}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-contain bg-black absolute inset-0 z-[1]"
                  >
                    <track kind="captions" src="data:text/vtt," srcLang="en" label="No captions" />
                  </video>
                  {/* Centre play overlay for non-autoplaying videos */}
                  {!isFirstVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 z-[2] transition-opacity duration-300 group-hover:opacity-0">
                      <div className="rounded-full p-3 shadow-lg"
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                  )}
                  {/* Live / Reel badge */}
                  {isFirstVideo && (
                    <div className="absolute top-3 left-3 z-[3] flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md"
                      style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse" />
                      Live
                    </div>
                  )}
                  {!isFirstVideo && (
                    <div className="absolute top-3 left-3 z-[3] flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <Film className="h-3 w-3 text-white/60" />
                      Reel
                    </div>
                  )}
                </>
              ) : (
                <img
                  src={item.media_url}
                  alt="Instagram Media"
                  className="w-full h-full object-contain bg-black absolute inset-0 z-[1] transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              )}

              {/* IG icon top-right */}
              <div className="absolute top-3 right-3 z-[3] rounded-full p-1.5 backdrop-blur-md"
                style={{ background: 'rgba(0,0,0,0.45)' }}>
                <Instagram className="h-3.5 w-3.5 text-white" />
              </div>

              {/* Premium "View on Instagram" pill — fades in on hover */}
              <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center pb-4 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                <div
                  className="flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-xl"
                  style={{
                    background: 'rgba(10, 10, 10, 0.72)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  <Instagram className="h-3 w-3 text-white/60 shrink-0" />
                  <span className="text-[11px] font-medium tracking-wide text-white/90 whitespace-nowrap">View on Instagram</span>
                  <span className="text-[10px] text-white/40">↗</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* MOBILE CAROUSEL VIEW (hidden on desktop/tablet) */}
      <div className="block md:hidden flex flex-col items-center">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="w-full flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {media.map((item, idx) => {
            const isVideo = item.media_type === 'VIDEO';
            const isActive = activeIndex === idx;

            return (
              <div
                key={item.id}
                className="w-full flex-shrink-0 snap-center snap-always"
              >
                <a
                  href={item.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-[9/16] rounded-3xl overflow-hidden bg-black"
                  style={{
                    boxShadow: isActive
                      ? '0 0 0 1.5px rgba(255,255,255,0.35)'
                      : '0 0 0 1px rgba(255,255,255,0.07)',
                    transition: 'box-shadow 0.3s ease',
                  }}
                >
                  {isVideo ? (
                    <>
                      <video
                        ref={(el) => { mobileVideoRefs.current[idx] = el; }}
                        data-is-video="true"
                        src={item.media_url}
                        poster={item.thumbnail_url}
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-contain bg-black absolute inset-0 z-0"
                      >
                        <track kind="captions" src="data:text/vtt," srcLang="en" label="No captions" />
                      </video>
                      {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 z-10">
                          <div className="rounded-full p-3 shadow-md"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                      )}
                      {/* Reel badge */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md"
                        style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <Film className="h-3 w-3 text-white/60" />
                        Reel
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.media_url}
                      alt="Instagram Media"
                      className="w-full h-full object-contain bg-black"
                      loading="lazy"
                    />
                  )}

                  {/* IG icon badge top-right */}
                  <div className="absolute top-3 right-3 z-10 rounded-full p-1.5 backdrop-blur-md"
                    style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <Instagram className="h-3.5 w-3.5 text-white" />
                  </div>

                  {/* Compact bottom pill — always visible on mobile */}
                  <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center pb-3">
                    <div
                      className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 backdrop-blur-xl"
                      style={{
                        background: 'rgba(10, 10, 10, 0.65)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      <Instagram className="h-3 w-3 text-white/60 shrink-0" />
                      <span className="text-[10px] font-medium text-white/85 tracking-wide">View Post</span>
                      <span className="text-[9px] text-white/35">↗</span>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex gap-1 mt-3 items-center justify-center">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSlide(idx)}
              className="h-12 w-12 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Go to Instagram slide ${idx + 1}`}
            >
              <span
                className={`rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? 'h-2.5 w-6 bg-white/50'
                    : 'h-2.5 w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Curated highlights fallback banner */}
      {isFallbackActive && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-xs text-muted-foreground bg-muted/20 border border-border/30 rounded-xl px-4 py-2.5 max-w-2xl mx-auto backdrop-blur-sm">
          <span>Showing curated studio highlights.</span>
          <a
            href={account === 'studio' ? 'https://instagram.com/studiospacecbe' : 'https://instagram.com/wanderingkitestudio'}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1 underline underline-offset-2"
          >
            <Instagram className="h-3.5 w-3.5" />
            View Live Profile on Instagram
          </a>
        </div>
      )}
    </div>
  );
}
