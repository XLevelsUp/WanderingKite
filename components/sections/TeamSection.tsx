'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, User } from 'lucide-react';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer } from '@/components/animations/StaggerContainer';

// Temporary placeholder data
const founder = {
  id: 'founder',
  name: 'Founder Name',
  role: 'Founder & Visionary',
  image: '/images/team/founder.jpg', // User will replace with actual local path
};

const teamMembers = [
  { id: '1', name: 'Team Member 1', role: 'Creative Director', image: '/images/team/member1.jpg' },
  { id: '2', name: 'Team Member 2', role: 'Lead Photographer', image: '/images/team/member2.jpg' },
  { id: '3', name: 'Team Member 3', role: 'Cinematographer', image: '/images/team/member3.jpg' },
  { id: '4', name: 'Team Member 4', role: 'Studio Manager', image: '/images/team/member4.jpg' },
  { id: '5', name: 'Team Member 5', role: 'Editor', image: '/images/team/member5.jpg' },
];

export function TeamSection() {
  return (
    <section className="py-24 container mx-auto px-6 relative">
      <FadeIn>
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-500 opacity-80">
            The Visionaries
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Meet the Team</h2>
          <p className="text-muted-foreground text-lg">
            The creative minds dedicated to crafting your visual legacy.
          </p>
        </div>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Founder Card - Clickable */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 }
          }}
          className="lg:col-span-1"
        >
          <Link href="/about/founder" className="block h-full group">
            <div className="relative h-full overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-900 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-amber-500/50 hover:shadow-amber-500/10">
              
              {/* Image Placeholder */}
              <div className="aspect-[4/5] relative bg-zinc-800">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
                {/* Fallback Icon if image fails/is missing */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <User className="w-20 h-20" />
                </div>
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

        {/* Team Members - Static */}
        {teamMembers.map((member) => (
          <motion.div
            key={member.id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
            className="lg:col-span-1"
          >
            <div className="relative h-full overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm group">
              <div className="aspect-[4/5] relative bg-zinc-800">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-10 transition-opacity duration-500 group-hover:opacity-20">
                  <User className="w-16 h-16" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transition-transform duration-500 group-hover:-translate-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  {member.role}
                </p>
                <h3 className="text-xl font-bold text-white">
                  {member.name}
                </h3>
              </div>
            </div>
          </motion.div>
        ))}

      </StaggerContainer>
    </section>
  );
}
