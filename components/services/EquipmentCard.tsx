'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import Image from 'next/image';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { useRentalCart } from '../rentals/RentalCartContext';

interface EquipmentCardProps {
  id: string;
  name: string;
  image: string;
  dailyRate: number;
  weeklyRate: number;
  available: boolean;
  specs: string[];
}

export function EquipmentCard({
  id,
  name,
  image,
  dailyRate,
  weeklyRate,
  available,
  specs,
}: EquipmentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { selectedItems, toggleItem } = useRentalCart();
  const isSelected = selectedItems?.has(id) || false;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty(
      '--mouse-x',
      `${e.clientX - rect.left}px`,
    );
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <motion.div
      whileHover={{
        y: -8,
        transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
      }}
      className='group spotlight-card h-full'
      onMouseMove={handleMouseMove}
      style={
        { '--mouse-x': '-400px', '--mouse-y': '-400px' } as React.CSSProperties
      }
    >
      <div
        ref={cardRef}
        className={`
          relative h-full overflow-hidden rounded-2xl
          bg-[rgba(17,17,22,0.80)] backdrop-blur-md
          transition-all duration-300
          ${isSelected 
            ? 'border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
            : 'border border-primary/15 group-hover:border-primary/40 group-hover:shadow-[0_20px_60px_hsl(var(--primary)/0.20)]'}
        `}
      >
        {/* Image / placeholder */}
        <div className='relative aspect-square overflow-hidden bg-[rgba(26,29,46,0.80)]'>
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
            />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <Camera className='h-16 w-16 text-primary/25 transition-all duration-300 group-hover:text-primary/50' />
            </div>
          )}

          {/* Availability badge */}
          {available ? (
            <span
              className='
              absolute right-3 top-3 rounded-full
              border border-emerald-500/30 bg-emerald-500/15
              px-3 py-1 text-xs font-semibold text-emerald-400
            '
            >
              Available
            </span>
          ) : (
            <span
              className='
              absolute right-3 top-3 rounded-full
              border border-primary/20 bg-primary/8
              px-3 py-1 text-xs font-semibold text-primary/60
            '
            >
              Rented
            </span>
          )}

          {/* Bottom gradient overlay */}
          <div className='absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#111116] to-transparent' />
        </div>

        {/* Card body */}
        <div className='p-5'>
          <h3 className='mb-3 text-base font-semibold text-foreground'>{name}</h3>

          {/* Specs */}
          <ul className='mb-4 space-y-1.5'>
            {specs.slice(0, 3).map((spec, i) => (
              <li
                key={i}
                className='flex items-center gap-2 text-xs text-foreground/55'
              >
                <span className='h-1 w-1 flex-shrink-0 rounded-full bg-primary opacity-60' />
                {spec}
              </li>
            ))}
          </ul>

          {/* Pricing */}
          <div className='mb-5 flex items-end gap-4'>
            <div>
              <p className='text-2xl font-bold text-primary'>₹{dailyRate}</p>
              <p className='text-xs text-foreground/45'>/day</p>
            </div>
            <div>
              <p className='text-base font-semibold text-foreground/70'>
                ₹{weeklyRate}
              </p>
              <p className='text-xs text-foreground/45'>/week</p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => available && toggleItem({ id, name, dailyRate })}
            disabled={!available}
            className={`
              block w-full rounded-xl py-3 text-center
              text-sm font-semibold transition-all duration-200
              ${!available 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50' 
                : isSelected
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-[0_8px_28px_hsl(var(--primary)/0.35)] hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {isSelected ? 'Remove from Quote' : 'Add to Quote'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
