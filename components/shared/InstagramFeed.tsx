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
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-[30px]">
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
              className="group rounded-2xl overflow-hidden aspect-[9/16] relative bg-card border border-border/40 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-brand-md hover:border-pink-500/30"
            >
              {isVideo ? (
                <>
                  <video
                    ref={(el) => {
                      desktopVideoRefs.current[visualIdx] = el;
                    }}
                    src={item.media_url}
                    poster={item.thumbnail_url}
                    autoPlay={isFirstVideo}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-contain bg-black absolute inset-0 z-0"
                  />
                  {/* Subtle video indicators */}
                  {isFirstVideo ? (
                    <div className="absolute top-3 right-3 z-10 bg-black/60 rounded-full p-1.5 backdrop-blur-sm border border-white/10">
                      <Film className="h-4 w-4 text-pink-400 animate-pulse" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 z-10 transition-opacity duration-300 group-hover:opacity-0">
                      <div className="bg-pink-500/90 text-white rounded-full p-3 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <img
                  src={item.media_url}
                  alt="Instagram Media"
                  className="w-full h-full object-contain bg-black transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              )}

              {/* Tint overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-4">
                <span className="text-xs text-white/90 font-medium flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5" />
                  View on Instagram
                </span>
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
          className="w-full flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {media.map((item, idx) => {
            const isVideo = item.media_type === 'VIDEO';

            return (
              <div
                key={item.id}
                className="w-full flex-shrink-0 snap-center snap-always"
              >
                <a
                  href={item.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group rounded-2xl overflow-hidden aspect-[9/16] relative bg-card border border-border/40 shadow-sm"
                >
                  {isVideo ? (
                    <>
                      <video
                        ref={(el) => {
                          mobileVideoRefs.current[idx] = el;
                        }}
                        data-is-video="true"
                        src={item.media_url}
                        poster={item.thumbnail_url}
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-contain bg-black absolute inset-0 z-0"
                      />
                      {activeIndex !== idx && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 z-10">
                          <div className="bg-pink-500/90 text-white rounded-full p-3 shadow-lg">
                            <Play className="h-5 w-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 z-10 bg-black/60 rounded-full p-1.5 backdrop-blur-sm border border-white/10 flex items-center gap-1 text-[10px] font-semibold text-white px-2 py-1">
                        <Film className="h-3 w-3 text-pink-400" />
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

                  {/* Visual Instagram Indicator */}
                  <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs text-white">
                    <Instagram className="h-4 w-4 text-pink-400" />
                    <span>View Post</span>
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex gap-2.5 mt-5 items-center justify-center">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeIndex === idx
                  ? 'w-6 bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to Instagram slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Curated highlights fallback banner */}
      {isFallbackActive && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-xs text-muted-foreground bg-muted/20 border border-border/30 rounded-xl px-4 py-2.5 max-w-2xl mx-auto backdrop-blur-sm">
          <span>Showing curated studio highlights.</span>
          <a
            href={account === 'studio' ? 'https://instagram.com/wanderingkitestudio' : 'https://instagram.com/wanderingkite'}
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
