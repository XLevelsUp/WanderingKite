'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, User, Users } from 'lucide-react';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer } from '@/components/animations/StaggerContainer';

const founder = {
  id: 'founder',
  name: 'Sandesh Anantha Kumar',
  role: 'Founder & Creative Director',
  image: '/founder.webp',
};

// Names are placeholders — fill in the real ones. The files are numbered
// rather than named so the images could be wired up before the names existed.
const teamMembers = [
  { id: 'team-1', name: 'Team Member 1', image: '/team/team-1.webp' },
  { id: 'team-2', name: 'Team Member 2', image: '/team/team-2.webp' },
  { id: 'team-3', name: 'Team Member 3', image: '/team/team-3.webp' },
  { id: 'team-4', name: 'Team Member 4', image: '/team/team-4.webp' },
  { id: 'team-5', name: 'Team Member 5', image: '/team/team-5.webp' },
];

// Removed individual team members array per new design requirements

export function TeamSection() {
  return (
    <section className="py-24 container mx-auto px-6 relative">
      <FadeIn>
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-500 opacity-80">
            The Visionaries
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meet the Team
          </h2>
          <p className="text-muted-foreground text-lg">
            The creative minds dedicated to crafting your visual legacy.
          </p>
        </div>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
        {/* Founder Card - Clickable */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          className="lg:col-span-1"
        >
          <Link href="/about/founder" className="block h-full group">
            <div className="relative h-full overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-900 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-amber-500/50 hover:shadow-amber-500/10">
              <div className="aspect-[4/5] relative bg-zinc-800">
                {/* Icon sits underneath the photo so it still shows if the
                    image ever fails to load. */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <User className="w-20 h-20" />
                </div>
                <Image
                  src={founder.image}
                  alt={`${founder.name}, ${founder.role} at Wandering Kite`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 block">
                      {founder.role}
                    </span>
                    <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {founder.name}
                    </h3>
                  </div>
                  <div className="bg-amber-500/10 p-3 rounded-full text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Team Members — individual portraits rather than one group photo, so
            each person is identifiable and nameable. */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          className="lg:col-span-1 h-full"
        >
          {/* No card chrome here on purpose: a bordered box around five
              portraits left a large dead area under them, since the grid is
              shorter than the founder card beside it. Portraits sit directly
              on the section background and are vertically centred instead. */}
          <div className="h-full flex flex-col justify-center">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.18em] mb-5">
              The Collective
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="group/member aspect-[3/4] relative overflow-hidden rounded-2xl bg-zinc-800"
                >
                  {/* Icon sits underneath so it shows if an image fails. */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Users className="w-7 h-7" />
                  </div>
                  <Image
                    src={member.image}
                    alt="Wandering Kite team member"
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover object-top transition-transform duration-500 group-hover/member:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </StaggerContainer>

      {/* Closing line, not a link: there is no /about/team route yet (only
          /about/founder), so linking this would 404. Wrap it in a <Link> once
          a team page exists. */}
      <FadeIn>
        <div className="mt-14 flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/40" />
          <p className="text-lg font-medium tracking-wide text-foreground">
            Meet the team
          </p>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/40" />
        </div>
      </FadeIn>
    </section>
  );
}
