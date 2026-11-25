'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

// Copy is drawn from the founder story (app/about/founder/FounderProfile.tsx).
const VALUES = [
  {
    title: 'Listen first, then create',
    body: 'Every project begins with a conversation. Understanding the people, the purpose, and the feeling behind a shoot comes before the camera.',
    src: '/images/values/listen.webp',
    alt: 'Photographer showing a bride and groom their photos on the camera screen',
    fit: 'cover',
    pos: 'center 45%',
  },
  {
    title: 'Tell every story honestly',
    body: 'Every story deserves to be told honestly, whether it belongs to a couple, a family, or a brand. The goal is photographs that feel true to the people in them.',
    src: '/images/values/honest.webp',
    alt: 'A young woman in a silk saree smiling, and her parents embracing her',
    fit: 'cover',
    pos: 'center',
  },
  {
    title: 'No strings attached',
    body: 'No limits on who we work with or what we create. Great creative work should be open to everyone with a story to tell.',
    src: '/images/values/open.webp',
    alt: 'Collage of weddings, ceremonies, couples and a young girl in traditional dress',
    // Square collage: cropping to 4:5 would cut its outer photos, so it is shown whole.
    fit: 'contain',
    pos: 'center',
  },
  {
    title: 'Present for every moment',
    body: 'Preparation and patience let us be fully present for the moments that cannot be repeated.',
    src: '/images/values/present.webp',
    alt: 'Couple in traditional dress sharing a tender moment with their poodle',
    fit: 'cover',
    pos: 'center 40%',
  },
] as const;

const STATS = [
  { value: 200, label: 'Weddings' },
  { value: 50, label: 'Corporate events' },
  { value: 100, label: 'Projects as Wandering Kite' },
];

const SETTLE = { type: 'spring', bounce: 0, duration: 0.9 } as const;
const pad2 = (n: number) => String(n).padStart(2, '0');

/** Counts up once on screen; writes text directly (no re-render per frame). Static under reduced motion. */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || reduce) return;
    const c = animate(0, to, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => { node.textContent = String(Math.round(v)); } });
    return () => c.stop();
  }, [inView, reduce, to]);
  return <span ref={ref} className="tabular-nums">{to}</span>;
}

/** Hero frame motif: porcelain mat over an offset sandstone block. */
function Frame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative pb-4 pr-4 sm:pb-5 sm:pr-5 ${className}`}>
      <div aria-hidden className="absolute bottom-0 left-4 right-0 top-4 bg-neutral sm:left-5 sm:top-5" />
      <div className="relative bg-background p-2.5 shadow-[0_1px_2px_hsl(var(--foreground)/0.08),0_14px_28px_-14px_hsl(var(--foreground)/0.3)] sm:p-3">
        {children}
      </div>
    </div>
  );
}

export function ValuesSection() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  // Phone carousel: which card is in view, and arrow paging (one card per step: card width + gap-4).
  const trackRef = useRef<HTMLOListElement>(null);
  const [slide, setSlide] = useState(0);
  const step = (t: HTMLOListElement) => ((t.firstElementChild as HTMLElement | null)?.offsetWidth ?? t.clientWidth) + 16;
  const goTo = (i: number) => {
    const t = trackRef.current;
    if (!t) return;
    const next = Math.max(0, Math.min(VALUES.length - 1, i));
    t.scrollTo({ left: next * step(t), behavior: reduce ? 'auto' : 'smooth' });
  };
  const onTrackScroll = () => {
    const t = trackRef.current;
    if (t) setSlide(Math.min(VALUES.length - 1, Math.round(t.scrollLeft / step(t))));
  };

  const reveal = (delay = 0) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { ...SETTLE, delay },
  });

  const heading = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-text sm:text-xs">Our Values</p>
      <h2
        id="values-heading"
        className="mt-4 text-balance text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl"
      >
        A kite flies best
        <span className="block text-accent-text">with no strings attached.</span>
      </h2>
    </>
  );

  return (
    <section aria-labelledby="values-heading" className="relative bg-background">
      {/* Strict spacing (8px grid): py 64/80/96/112, block gap 48 → 64 at lg, inner 32/24. Same width steps as the hero. */}
      <div className="mx-auto w-full max-w-7xl px-5 pb-6 pt-16 sm:px-8 sm:pt-20 lg:px-12 lg:pb-8 lg:pt-24 2xl:max-w-[88rem] 2xl:pt-28 3xl:max-w-[112rem] 3xl:px-16">
        {/* ── DESKTOP lg+: framed photo left (follows the active value), heading + value list right ── */}
        <div className="hidden items-center gap-16 lg:grid lg:grid-cols-12">
          <motion.div {...reveal(0)} className="col-span-6 flex justify-center xl:col-span-5">
            <Frame>
              {/* All four photos stacked; only opacity changes, so switching is instant and compositor-only. */}
              <div data-shutter className="relative aspect-[4/5] h-[min(62svh,36rem)] overflow-hidden bg-muted 2xl:h-[min(62svh,42rem)]">
                {VALUES.map((v, i) => (
                  <Image
                    key={v.src}
                    src={v.src}
                    alt={i === active ? v.alt : ''}
                    aria-hidden={i !== active}
                    fill
                    sizes="(min-width: 1536px) 34rem, 29rem"
                    style={{ objectPosition: v.pos }}
                    className={`${v.fit === 'contain' ? 'object-contain' : 'object-cover'} transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
                      i === active ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'
                    }`}
                  />
                ))}
              </div>
              <p className="pt-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground" aria-live="polite">
                {pad2(active + 1)} · {VALUES[active].title}
              </p>
            </Frame>
          </motion.div>

          <div className="col-span-6 xl:col-span-7">
            <motion.div {...reveal(0.05)}>{heading}</motion.div>

            <ol className="mt-8">
              {VALUES.map((v, i) => {
                const on = i === active;
                return (
                  <motion.li key={v.title} {...reveal(0.08 + 0.05 * i)} className="border-t border-border last:border-b">
                    <button
                      type="button"
                      aria-expanded={on}
                      aria-controls={`value-body-${i}`}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      className="group flex w-full items-center gap-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className={`text-[11px] font-semibold tracking-[0.24em] tabular-nums transition-colors duration-300 ${on ? 'text-accent-text' : 'text-foreground/65'}`}>
                        {pad2(i + 1)}
                      </span>
                      <span className={`flex-1 text-xl font-semibold tracking-[-0.015em] transition-colors duration-300 xl:text-2xl ${on ? 'text-foreground' : 'text-foreground/60 group-hover:text-foreground'}`}>
                        {v.title}
                      </span>
                      <Plus aria-hidden className={`h-5 w-5 shrink-0 text-foreground transition-transform duration-300 ${on ? 'rotate-45' : ''}`} />
                    </button>
                    {/* grid-rows 0fr→1fr: smooth open/close without measuring heights. */}
                    <div
                      id={`value-body-${i}`}
                      className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-xl pb-6 pl-[calc(1.5rem+2ch)] text-base leading-relaxed text-foreground/80">{v.body}</p>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* ── MOBILE / TABLET <lg: heading, then one card per value with its photo ── */}
        <div className="lg:hidden">
          <motion.div {...reveal(0)}>{heading}</motion.div>
          {/* Phone-only arrows + counter, above the cards (tablets show all four in a grid). 44px targets. */}
          <div className="mt-8 flex items-center justify-between md:hidden">
            <p className="text-[11px] font-semibold tracking-[0.24em] tabular-nums text-foreground" aria-live="polite">
              {pad2(slide + 1)} <span className="text-foreground/65">/ {pad2(VALUES.length)}</span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => goTo(slide - 1)}
                disabled={slide === 0}
                aria-label="Previous value"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-primary bg-background text-foreground transition-[transform,opacity,background-color] duration-200 hover:bg-card active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => goTo(slide + 1)}
                disabled={slide === VALUES.length - 1}
                aria-label="Next value"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[transform,opacity,background-color] duration-200 hover:bg-primary/90 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Phones: swipeable row (next card peeks) instead of four stacked cards; tablets: 2-column grid. */}
          <ol ref={trackRef} onScroll={onTrackScroll} aria-label="Our values" className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 md:mx-0 md:mt-12 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
            {VALUES.map((v, i) => (
              <motion.li key={v.title} {...reveal(0.05 * i)} className="w-[84%] shrink-0 snap-start md:w-auto">
                <Frame>
                  {/* 4:5 like desktop — a wide crop would cut the two-panel and collage photos. */}
                  <div data-shutter className={`relative aspect-[4/5] overflow-hidden ${v.fit === 'contain' ? 'bg-background' : 'bg-muted'}`}>
                    <Image src={v.src} alt={v.alt} fill sizes="(min-width: 768px) 45vw, 84vw" style={{ objectPosition: v.pos }} className={v.fit === 'contain' ? 'object-contain' : 'object-cover'} />
                  </div>
                </Frame>
                <p className="mt-6 text-[11px] font-semibold tracking-[0.24em] text-accent-text">{pad2(i + 1)}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.015em] text-foreground sm:text-2xl">{v.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-foreground/80">{v.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* ── Founder + proof band ── */}
        <motion.div
          {...reveal(0.1)}
          className="mt-12 grid overflow-hidden rounded-2xl bg-card lg:mt-16 lg:grid-cols-12"
        >
          {/* Compact band — strict 8px spacing: 24px padding everywhere, 16px gaps. */}
          <figure className="flex items-center gap-4 border-b border-border p-6 lg:col-span-6 lg:border-b-0 lg:border-r xl:col-span-5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
              <Image src="/founder.webp" alt="Sandesh Anantha Kumar" fill sizes="56px" className="object-cover object-top" />
            </div>
            <div className="min-w-0">
              <blockquote className="text-sm leading-snug text-foreground">
                &ldquo;I wanted the freedom to work with everyone and tell every kind of story.&rdquo;
              </blockquote>
              <figcaption className="mt-1 text-xs text-foreground/70">
                <span className="font-semibold text-foreground">Sandesh Anantha Kumar</span> · Founder &amp; Creative Director
              </figcaption>
              {/* -my-2 keeps the 44px tap target without adding visible height. */}
              <Link
                href="/about/founder"
                className="group -my-2 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-foreground transition-colors duration-200 hover:text-accent-text sm:text-sm"
              >
                Read the founder story
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </figure>

          <dl className="grid grid-cols-3 lg:col-span-6 xl:col-span-7">
            {STATS.map((s, i) => (
              // flex-col-reverse.
              <div key={s.label} className={`flex flex-col-reverse justify-end p-4 text-center sm:p-6 lg:text-left ${i > 0 ? 'border-l border-border' : ''}`}>
                <dt className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground sm:text-[11px]">{s.label}</dt>
                <dd className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold leading-none tracking-[-0.035em] text-foreground">
                  <CountUp to={s.value} />
                  <span className="text-accent-text">+</span>
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
