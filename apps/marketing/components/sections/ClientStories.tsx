'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Story {
  name: string;
  role: string;
  content: string;
  rating: number;
  service?: string;
}

const SETTLE = { type: 'spring', bounce: 0, duration: 0.9 } as const;
const DWELL_S = 7; // seconds per review before auto-advancing

/* Homepage "What Our Clients Say" as a spotlight. */
export function ClientStories({ stories }: { stories: Story[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false); // hover / focus pauses; a click stops for good
  const [stopped, setStopped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const auto = !reduce && !paused && !stopped && !expanded;
  const s = stories[active];

  const select = (i: number) => { setActive(i); setExpanded(false); setStopped(true); };
  const next = () => setActive((a) => (a + 1) % stories.length);

  // "Read more" only when the clamped quote overflows.
  useEffect(() => {
    const el = textRef.current;
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 2);
  }, [active, expanded]);

  // Keep the active tab visible in the phone tab row (scrolls the row only, never the page).
  useEffect(() => {
    const tab = tabRefs.current[active];
    const row = tab?.parentElement;
    if (tab && row && row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: tab.offsetLeft - row.clientWidth / 2 + tab.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [active, reduce]);

  const reveal = (delay = 0) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { ...SETTLE, delay },
  });

  return (
    <section aria-labelledby="stories-heading" className="border-y border-border bg-card">
      {/* Strict spacing (8px grid): top + bottom 24/32 (one block gap to each neighbour), column gap 48 → 64. */}
      <div
        className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-6 pt-6 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12 lg:pb-8 lg:pt-8 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {/* ── Left: heading + reviewer tabs ── */}
        <motion.div {...reveal(0)} className="min-w-0 lg:col-span-4">
          <h2 id="stories-heading" className="text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">
            What Our Clients Say
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-foreground">
            Real feedback from creators, brands, and clients who have worked with us.
          </p>

          {/* Tabs: a sideways row on phones/tablets, a vertical list on desktop. */}
          <div
            role="tablist"
            aria-label="Reviews"
            className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {stories.map((st, i) => {
              const on = i === active;
              return (
                <button
                  key={`${st.name}-${i}`}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="story-panel"
                  onClick={() => select(i)}
                  className={`relative shrink-0 rounded-full border px-4 py-2 text-left transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:rounded-none lg:border-0 lg:border-t lg:border-border lg:px-0 lg:py-3 lg:last:border-b ${
                    on ? 'border-accent-text bg-accent-text/5 lg:bg-transparent' : 'border-border bg-background hover:border-accent-text/60 lg:bg-transparent'
                  }`}
                >
                  <span className={`block truncate text-sm font-semibold capitalize transition-colors duration-300 lg:pl-5 ${on ? 'text-foreground' : 'text-foreground/60'}`}>
                    {st.name}
                  </span>
                  {/* Desktop: orange marker + dwell progress for the active tab. */}
                  <span aria-hidden className={`absolute left-0 top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent-text transition-opacity duration-300 lg:block ${on ? 'opacity-100' : 'opacity-0'}`} />
                  {on && (
                    <span aria-hidden className="absolute inset-x-0 -bottom-px hidden h-px overflow-hidden lg:block">
                      {auto ? (
                        <motion.span
                          key={`p-${active}`}
                          className="block h-full origin-left bg-accent-text"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: DWELL_S, ease: 'linear' }}
                          onAnimationComplete={next}
                        />
                      ) : (
                        <span className="block h-full bg-accent-text" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Phones/tablets: advance on a timer (on desktop the progress bar drives it). */}
          {auto && <AutoAdvance key={`a-${active}`} seconds={DWELL_S} onDone={next} />}
        </motion.div>

        {/* ── Right: the spotlight quote ── */}
        <motion.div {...reveal(0.08)} className="min-w-0 lg:col-span-8 lg:self-center">
          <div id="story-panel" role="tabpanel" aria-live="polite" className="relative rounded-2xl border border-border bg-background p-6 sm:p-8 lg:p-12">
            <span aria-hidden className="absolute right-6 top-4 font-serif text-7xl leading-none text-accent-text/25 sm:right-8 lg:right-12 lg:top-8">&ldquo;</span>

            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={active}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex gap-1">
                  <span className="sr-only">Rated {s.rating} out of 5</span>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} aria-hidden="true" className={`h-4 w-4 ${i < s.rating ? 'fill-accent-text text-accent-text' : 'text-border'}`} />
                  ))}
                </div>

                <blockquote className="mt-6">
                  <p
                    ref={textRef}
                    className={`max-w-3xl whitespace-pre-line text-lg font-medium leading-relaxed text-foreground sm:text-xl ${expanded ? '' : 'line-clamp-5'}`}
                  >
                    {s.content}
                  </p>
                </blockquote>
                {(overflowing || expanded) && (
                  <button
                    type="button"
                    onClick={() => { setExpanded((v) => !v); setStopped(true); }}
                    aria-expanded={expanded}
                    className="mt-2 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
                  >
                    {expanded ? 'Read less' : 'Read more'}
                  </button>
                )}

                <figcaption className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                  <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-text/10 text-base font-semibold uppercase text-accent-text ring-1 ring-accent-text/30">
                    {s.name.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold capitalize text-foreground">{s.name}</span>
                    <span className="block truncate text-sm text-foreground/70">
                      {s.role}
                      {s.service ? ` · ${s.service}` : ''}
                    </span>
                  </span>
                  <span className="ml-auto shrink-0 text-[11px] font-semibold tabular-nums tracking-[0.24em] text-foreground" aria-hidden>
                    <span className="text-accent-text">{String(active + 1).padStart(2, '0')}</span> <span className="text-foreground/65">/ {String(stories.length).padStart(2, '0')}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** Timer for phones/tablets, where the desktop progress bar (which also advances) is hidden. */
function AutoAdvance({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) return; // desktop: the progress bar advances
    const t = window.setTimeout(onDone, seconds * 1000);
    return () => window.clearTimeout(t);
  }, [seconds, onDone]);
  return null;
}
