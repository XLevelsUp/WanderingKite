'use client';

import { useRef, useCallback, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import Image from 'next/image';
import { useRentalCart } from '../rentals/RentalCartContext';

interface EquipmentCardProps {
  id: string;
  name: string;
  image: string;
  available: boolean;
  specs: string[];
  pricingPlans: Array<{
    name: string;
    durationHours: number;
    rate: number;
  }>;
}

export function EquipmentCard({
  id,
  name,
  image,
  available,
  specs,
  pricingPlans = [],
}: EquipmentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { selectedItems, toggleItem } = useRentalCart();

  const cartItem = selectedItems?.get(id);
  const isSelected = !!cartItem;

  // Sort plans by duration hours so Hourly comes first, then Daily, etc.
  const sortedPlans = useMemo(() => {
    return [...pricingPlans].sort((a, b) => a.durationHours - b.durationHours);
  }, [pricingPlans]);

  const [selectedPlanIndex, setSelectedPlanIndex] = useState(() => {
    // Try to default to 'Daily' plan if it exists
    const dailyIdx = sortedPlans.findIndex(
      (p) => p.name.toLowerCase() === 'daily'
    );
    return dailyIdx !== -1 ? dailyIdx : 0;
  });

  const activePlan = sortedPlans[selectedPlanIndex];
  const currentPlan = isSelected ? cartItem.selectedPlan : activePlan;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty(
      '--mouse-x',
      `${e.clientX - rect.left}px`
    );
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <motion.div
      whileHover={{
        y: -8,
        transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
      }}
      className="group spotlight-card h-full"
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
          ${
            isSelected
              ? 'border-2 border-warning shadow-[0_0_20px_hsl(var(--color-warning)/0.2)]'
              : 'border border-primary/15 group-hover:border-primary/40 group-hover:shadow-[0_20px_60px_hsl(var(--primary)/0.20)]'
          }
        `}
      >
        {/* Image / placeholder */}
        <div className="relative aspect-square overflow-hidden bg-[rgba(26,29,46,0.80)]">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Camera className="h-16 w-16 text-primary/25 transition-all duration-300 group-hover:text-primary/50" />
            </div>
          )}

          {/* Availability badge */}
          {available ? (
            <span
              className="
              absolute right-3 top-3 rounded-full
              border border-emerald-500/30 bg-emerald-500/15
              px-3 py-1 text-xs font-semibold text-emerald-400
            "
            >
              Available
            </span>
          ) : (
            <span
              className="
              absolute right-3 top-3 rounded-full
              border border-primary/20 bg-primary/8
              px-3 py-1 text-xs font-semibold text-primary/60
            "
            >
              Rented
            </span>
          )}

          {/* Bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#111116] to-transparent" />
        </div>

        {/* Card body */}
        <div className="p-5 flex flex-col justify-between h-[calc(100%-100%]">
          <div>
            <h3 className="mb-3 text-base font-semibold text-foreground truncate">
              {name}
            </h3>

            {/* Specs */}
            <ul className="mb-4 space-y-1.5 min-h-[4.5rem]">
              {specs.slice(0, 3).map((spec, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-xs text-foreground/55"
                >
                  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-primary opacity-60" />
                  {spec}
                </li>
              ))}
            </ul>
          </div>

          <div>
            {/* Pricing & Plan Switcher */}
            <div className="mb-5 border-t border-primary/10 pt-4">
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold text-primary">
                  ₹{(currentPlan?.rate ?? 0).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-foreground/45">
                  {currentPlan ? `for ${currentPlan.name} (${currentPlan.durationHours}h)` : ''}
                </p>
              </div>

              {sortedPlans.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sortedPlans.map((plan, idx) => {
                    const isPlanActive = isSelected
                      ? cartItem.selectedPlan.name === plan.name
                      : selectedPlanIndex === idx;
                    return (
                      <button
                        key={plan.name}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelected) {
                            toggleItem({ id, name }, plan);
                          } else {
                            setSelectedPlanIndex(idx);
                          }
                        }}
                        className={`
                          rounded-full px-3 py-1 text-[10px] font-semibold transition-all duration-200 border
                          ${
                            isPlanActive
                              ? 'bg-warning/20 text-warning border-warning/40'
                              : 'bg-zinc-900/60 text-zinc-400 border-primary/10 hover:border-primary/30 hover:text-white'
                          }
                        `}
                      >
                        {plan.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={() =>
                available && currentPlan && toggleItem({ id, name }, currentPlan)
              }
              disabled={!available}
              className={`
                block w-full rounded-xl py-3 text-center
                text-sm font-semibold transition-all duration-200
                ${
                  !available
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                    : isSelected
                      ? 'bg-warning/20 text-warning border border-warning/50 hover:bg-warning/30'
                      : 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-[0_8px_28px_hsl(var(--primary)/0.35)] hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {isSelected ? 'Remove from Quote' : 'Add to Quote'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
