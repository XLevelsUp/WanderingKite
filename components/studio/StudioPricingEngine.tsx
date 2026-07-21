'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Camera,
  Focus,
  Lightbulb,
  User,
  Users,
  Plus,
  Box,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { useNotify } from '@/hooks/useNotify';

const PACKAGES = [
  {
    id: 'hourly',
    name: 'Hourly Flex',
    price: 999,
    originalPrice: 1499,
    duration: '/per hr',
    desc: 'Includes Photo/Video Space, 3 Lights, 1 Tripod',
    save: 500,
  },
  {
    id: 'half-day',
    name: 'Half Day',
    price: 3499,
    originalPrice: 3999,
    duration: '/4 hrs',
    desc: 'Perfect for portrait sessions or quick product shoots.',
    save: 500,
  },
  {
    id: 'full-day',
    name: 'Full Day',
    price: 6999,
    originalPrice: 7999,
    duration: '/8 hrs',
    desc: 'Best for elaborate setups, commercial shoots, and music videos.',
    save: 1000,
    bestValue: true,
  },
];

const ADD_ONS = [
  {
    id: 'cameraman',
    name: 'Pro Cameraman',
    price: 1000,
    unit: 'hr',
    icon: User,
  },
  {
    id: 'assistant',
    name: 'Studio Assistant',
    price: 250,
    unit: 'hr',
    icon: Users,
  },
];
const getEquipmentHourlyRate = (item: any): number => {
  if (!item) return 0;
  
  // 1. Try studioPricingPlans first
  const studioPlans = Array.isArray(item.studioPricingPlans) ? item.studioPricingPlans : [];
  const studioHourlyPlan = studioPlans.find((p: any) => p.name?.toLowerCase() === 'hourly');
  if (studioHourlyPlan) return Number(studioHourlyPlan.rate) || 0;

  // 2. Try flat studio_hourly_rate column
  if (item.studio_hourly_rate && Number(item.studio_hourly_rate) > 0) {
    return Number(item.studio_hourly_rate);
  }
  
  // 3. Fallback to legacy pricingPlans
  const plans = Array.isArray(item.pricingPlans) ? item.pricingPlans : [];
  const hourlyPlan = plans.find((p: any) => p.name?.toLowerCase() === 'hourly');
  if (hourlyPlan) return Number(hourlyPlan.rate) || 0;
  
  const dailyPlan = plans.find((p: any) => p.name?.toLowerCase() === 'daily');
  if (dailyPlan) return Math.round((Number(dailyPlan.rate) || 0) / 10);
  
  if (plans.length > 0) {
    const first = plans[0];
    const duration = Number(first.durationHours) || 1;
    return Math.round((Number(first.rate) || 0) / duration);
  }
  
  return 0;
};

export function StudioPricingEngine({ equipment = [] }: { equipment?: any[] }) {
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[2]); // Default to Full Day
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showInfo } = useNotify();

  const toggleAddOn = (id: string) => {
    const newSet = new Set(selectedAddOns);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAddOns(newSet);
  };

  const toggleEquipment = (id: string) => {
    const newSet = new Set(selectedEquipment);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedEquipment(newSet);
  };

  const packageHours =
    selectedPackage.id === 'hourly'
      ? 1
      : selectedPackage.id === 'half-day'
        ? 4
        : 8;

  const subtotal = useMemo(() => {
    let total = selectedPackage.price;
    selectedAddOns.forEach((id) => {
      const addon = ADD_ONS.find((a) => a.id === id);
      if (addon) {
        total += addon.price * packageHours;
      }
    });
    selectedEquipment.forEach((id) => {
      const eq = equipment.find((e) => e.id === id);
      if (eq) {
        total += getEquipmentHourlyRate(eq) * packageHours;
      }
    });
    return total;
  }, [
    selectedPackage,
    selectedAddOns,
    selectedEquipment,
    packageHours,
    equipment,
  ]);

  const gst = subtotal * 0.18;
  const finalTotal = subtotal + gst;

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const generateBookingMessage = () => {
    const addOnNames = Array.from(selectedAddOns)
      .map((id) => ADD_ONS.find((a) => a.id === id)?.name)
      .join(', ');
    const addOnString = addOnNames ? ` + [${addOnNames}]` : '';
    return `Hi! I'd like to book: [${selectedPackage.name}]${addOnString}. Total Estimate: ${formatINR(Math.round(finalTotal))} (incl. GST).`;
  };

  const handleBookingRequest = async () => {
    setIsLoading(true);
    let timeoutId: NodeJS.Timeout;

    try {
      timeoutId = setTimeout(() => {
        showInfo(
          'This is taking longer than usual. Please check your connection.'
        );
      }, 8000);

      await new Promise((resolve) => setTimeout(resolve, 300));
      window.open(
        generateWhatsAppLink('studio', generateBookingMessage()),
        '_blank',
        'noopener,noreferrer'
      );
    } catch (error) {
      showError('Failed to initiate booking request. Please try again.');
    } finally {
      clearTimeout(timeoutId!);
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-16">
      <div className="mb-8 flex items-center gap-3">
        <span className="rounded-full border border-warning/30 bg-warning/10 px-4 py-1 text-sm font-semibold text-warning">
          Quotation Engine
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 flex flex-col gap-4 w-full">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`relative cursor-pointer transition-all duration-300 rounded-2xl border p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6
                                 ${
                                   selectedPackage.id === pkg.id
                                     ? 'border-warning bg-warning/10 shadow-[0_0_20px_-5px_hsl(var(--color-warning)/0.2)] sm:scale-[1.02]'
                                     : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-900 sm:hover:scale-[1.01]'
                                 }`}
            >
              {pkg.bestValue && (
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-3 left-6 rounded-full bg-warning px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-warning-foreground"
                >
                  Best Value
                </motion.span>
              )}

              <div className="text-left flex-1 w-full">
                <div className="flex flex-row items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-none">{pkg.name}</h3>
                  <span className="rounded bg-warning/10 border border-warning/20 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-warning inline-block">
                    {pkg.duration.replace('/', '')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">{pkg.desc}</p>
              </div>

              <div className="text-left sm:text-right flex-shrink-0 flex flex-col items-start sm:items-end mt-2 sm:mt-0 w-full sm:w-auto border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-lg sm:text-xl font-medium text-zinc-500 line-through"
                    aria-label={`Original price ${formatINR(pkg.originalPrice)}`}
                  >
                    {formatINR(pkg.originalPrice)}
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-warning">
                    {formatINR(pkg.price)}
                  </span>
                </div>
                {pkg.save > 0 && (
                  <div className="flex items-center gap-2 mt-1 sm:mt-2">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-500/20 inline-block">
                      {Math.round((pkg.save / pkg.originalPrice) * 100)}% OFF
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      Save {formatINR(pkg.save)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 h-full">
            <h4 className="text-lg font-bold text-white mb-4">
              Add-ons (Optional)
            </h4>
            <div className="space-y-3">
              {ADD_ONS.map((addon) => {
                const isSelected = selectedAddOns.has(addon.id);
                return (
                  <label
                    key={addon.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors
                                            ${isSelected ? 'border-warning/50 bg-warning/5' : 'border-white/5 bg-zinc-900/80 hover:border-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-warning focus:ring-warning focus:ring-offset-zinc-950"
                          checked={isSelected}
                          onChange={() => toggleAddOn(addon.id)}
                        />
                      </div>
                      <addon.icon
                        className={`w-4 h-4 ${isSelected ? 'text-warning' : 'text-zinc-500'}`}
                      />
                      <span
                        className={`text-sm ${isSelected ? 'text-white' : 'text-zinc-400'}`}
                      >
                        {addon.name}
                      </span>
                    </div>
                    <span className="text-sm font-mono text-zinc-400">
                      +{formatINR(addon.price)}/{addon.unit}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Equipment Add-ons */}
        {equipment.length > 0 && (
          <div className="lg:col-span-12 mt-4 mb-2 w-full overflow-hidden">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">
                In-Studio Equipment Add-ons
              </h3>
              <p className="text-zinc-400 mt-1">
                Rent gear directly for your studio session
              </p>
            </div>

            <div className="space-y-8 w-full">
              {[
                { title: 'Cameras', key: 'camera' },
                { title: 'Lenses', key: 'lens' },
                { title: 'Lighting', key: 'light' },
                { title: 'Audio/Mic', key: 'audio' },
                { title: 'Others', key: 'other' },
              ].map((cat) => {
                const items = equipment.filter((e) => {
                  const catName = e.category_name?.toLowerCase() || (e.categories as any)?.name?.toLowerCase() || '';
                  return catName.includes(cat.key);
                });
                if (items.length === 0) return null;
                return (
                  <div key={cat.key} className="w-full">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      {cat.title}
                    </h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar w-full max-w-full overflow-y-hidden">
                      {items.map((item) => {
                        const isSelected = selectedEquipment.has(item.id);
                        const hourly = getEquipmentHourlyRate(item);
                        return (
                          <div
                            key={item.id}
                            className={`min-w-[240px] flex-shrink-0 rounded-2xl border p-4 flex flex-col gap-3 transition-colors cursor-pointer snap-start
                                                            ${isSelected ? 'border-warning bg-warning/10 shadow-[0_0_15px_-5px_hsl(var(--color-warning)/0.15)]' : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-900'}`}
                            onClick={() => toggleEquipment(item.id)}
                          >
                            <div className="aspect-video relative rounded-lg bg-zinc-800/50 overflow-hidden">
                              {item.imageUrl || item.image_url ? (
                                <Image
                                  src={item.imageUrl || item.image_url}
                                  alt={item.name}
                                  fill
                                  className="object-contain p-2"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                  <Camera className="w-8 h-8 opacity-50" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-sm line-clamp-1">
                                {item.name}
                              </h5>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-warning font-mono text-sm">
                                  {formatINR(hourly)}/hr
                                </span>
                                <button
                                  aria-label={isSelected ? `Remove ${item.name} from booking` : `Add ${item.name} to booking`}
                                  aria-pressed={isSelected}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors
                                                                        ${isSelected ? 'bg-warning border-warning text-warning-foreground' : 'border-zinc-600 text-zinc-400'}`}
                                >
                                  {isSelected ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Plus className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedEquipment.size > 0 && (
              <div className="mt-4 flex justify-end">
                <div className="rounded-xl border border-warning/30 bg-warning/5 px-6 py-3 text-sm flex items-center gap-2">
                  <span className="text-zinc-400">
                    Studio Equipment Add-ons:{' '}
                  </span>
                  <span className="text-warning font-mono font-bold text-lg">
                    {formatINR(
                      Array.from(selectedEquipment).reduce((acc, id) => {
                        const eq = equipment.find((e) => e.id === id);
                        return (
                          acc +
                          (eq
                            ? getEquipmentHourlyRate(eq) * packageHours
                            : 0)
                        );
                      }, 0)
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary Full Width Banner */}
        <div className="lg:col-span-12 mt-4">
          <div className="rounded-2xl border border-warning/20 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative md:sticky md:bottom-6 z-10">
            <div className="flex-1 w-full">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Estimated Total
              </h4>
              <div className="flex flex-wrap items-end gap-6 sm:gap-12">
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Subtotal</p>
                  <p className="font-mono text-lg text-zinc-300">
                    {formatINR(subtotal)}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">GST (18%)</p>
                  <p className="font-mono text-lg text-zinc-500">
                    {formatINR(Math.round(gst))}
                  </p>
                </div>
                <div>
                  <p className="text-white text-sm mb-1 font-bold">
                    Total Payable
                  </p>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={finalTotal}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-4xl font-bold text-warning inline-block"
                    >
                      {formatINR(Math.round(finalTotal))}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col items-center md:items-end flex-shrink-0">
              <button
                onClick={handleBookingRequest}
                disabled={isLoading}
                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-full bg-warning px-8 py-4 text-center font-bold text-warning-foreground transition-all hover:opacity-90 hover:shadow-[0_0_30px_-5px_hsl(var(--color-warning)/0.5)] whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Opening...' : 'Request Booking'}
              </button>
              <p className="text-xs text-zinc-500 mt-3">
                No payment required to request
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
