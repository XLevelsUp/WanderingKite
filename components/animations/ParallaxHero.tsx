'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

interface ParallaxHeroProps {
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  badge?: {
    icon: React.ReactNode;
    text: string;
    color: string;
  };
  cta?: {
    text: string;
    href: string;
  };
}

export function ParallaxHero({
  title,
  subtitle,
  gradientFrom,
  gradientTo,
  badge,
  cta,
}: ParallaxHeroProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 py-24"
    >
      <motion.div style={{ y, opacity }} className="container mx-auto px-6">
        <div className="mx-auto max-w-4xl text-center">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`mb-6 inline-flex items-center gap-2 rounded-full border ${badge.color} px-4 py-2 text-sm`}
            >
              {badge.icon}
              {badge.text}
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl"
          >
            {title.split('\n').map((line, i) => (
              <span key={i}>
                {i === 1 ? (
                  <span
                    className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}
                  >
                    {line}
                  </span>
                ) : (
                  line
                )}
                {i === 0 && <br />}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8 text-xl text-muted-foreground"
          >
            {subtitle}
          </motion.p>

          {cta && (
            <motion.a
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block rounded-full px-8 py-4 font-semibold transition-all ${gradientFrom.includes('amber') ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/50' : gradientFrom.includes('blue') ? 'bg-blue-500 text-foreground hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/50' : gradientFrom.includes('purple') ? 'bg-purple-500 text-foreground hover:bg-purple-400 hover:shadow-lg hover:shadow-purple-500/50' : 'bg-green-500 text-foreground hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/50'}`}
            >
              {cta.text}
            </motion.a>
          )}
        </div>
      </motion.div>
    </section>
  );
}
