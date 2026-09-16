'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Camera,
  Focus,
  Lightbulb,
  User,
  Plus,
  Box,
  Loader2,
  Clock,
} from 'lucide-react';
import Image from 'next/image';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { useNotify } from '@/hooks/useNotify';

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

/** Static, non-quotable packages shown beside the engine (e.g. Podcast Studio).
 *  These are booked directly over WhatsApp and deliberately take no part in the
 *  subtotal/GST calculation — they are a fixed-price menu, not selectable line
 *  items. */
export interface SidePackage {
  name: string;
  price: number;
  originalPrice?: number;
  durationLabel: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export function StudioPricingEngine({
  equipment = [],
  packages = [],
  addOns = [],
  sidePackages = [],
  sidePackagesTitle,
  sidePackagesService = 'studio',
}: {
  equipment?: any[];
  packages?: any[];
  addOns?: any[];
  sidePackages?: SidePackage[];
  sidePackagesTitle?: string;
  /** WhatsApp routing key for side-package bookings. A plain string rather than
   *  a callback, because this is a Client Component and the page rendering it is
   *  a Server Component — functions cannot cross that boundary. */
  sidePackagesService?: string;
}) {
  // Starts empty on purpose. In-studio equipment is priced against a package's
  // duration, so it cannot be chosen until a package is. Pre-selecting one made
  // the equipment list look like the standalone /rentals catalogue.
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
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
    // Guard as well as disable the UI: equipment priced against a package's
    // duration is meaningless without one.
    if (!selectedPackage) return;
    const newSet = new Set(selectedEquipment);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedEquipment(newSet);
  };

  // Clicking the selected package again clears it. Equipment is cleared with it
  // so nothing priced against the old duration survives into the total.
  const togglePackage = (pkg: any) => {
    if (selectedPackage?.id === pkg.id) {
      setSelectedPackage(null);
      setSelectedEquipment(new Set());
    } else {
      setSelectedPackage(pkg);
    }
  };

  // Duration label doesn't carry a stable machine-readable id anymore (admin
  // can rename/reorder packages freely), so the hour multiplier is parsed
  // from its leading number — "4 Hours" -> 4, "Per Hour" -> 1 (no leading digit).
  const packageHours = selectedPackage
    ? parseInt(selectedPackage.duration_label?.match(/^(\d+)/)?.[1] ?? '1', 10)
    : 1;

  const subtotal = useMemo(() => {
    let total = selectedPackage ? selectedPackage.price : 0;
    selectedAddOns.forEach((id) => {
      const addon = addOns.find((a) => a.id === id);
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
    addOns,
  ]);

  const gst = subtotal * 0.18;
  const finalTotal = subtotal + gst;

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const generateBookingMessage = () => {
    const addOnNames = Array.from(selectedAddOns)
      .map((id) => addOns.find((a) => a.id === id)?.name)
      .join(', ');
    const addOnString = addOnNames ? ` + [${addOnNames}]` : '';
    // Selected equipment is already priced into finalTotal, so it has to be
    // listed here too — otherwise staff receive a total they cannot reconcile
    // against the items named in the message.
    const equipmentNames = Array.from(selectedEquipment)
      .map((id) => equipment.find((e) => e.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    const equipmentString = equipmentNames
      ? ` + in-studio equipment [${equipmentNames}]`
      : '';
    return `Hi! I'd like to book: [${selectedPackage?.name ?? 'Studio Session'}]${addOnString}${equipmentString}. Total Estimate: ${formatINR(Math.round(finalTotal))} (incl. GST).`;
  };

  const handleBookingRequest = async () => {
    if (!selectedPackage) {
      showInfo('Please select a session package first.');
      return;
    }
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
    <div className="mb-6">
      {/* Header row mirrors the 6/6 package grid below so each badge and its
          rule sit directly over the column they label, instead of one full-width
          rule that reads as a heading for both. */}
      <div className="mb-6 grid lg:grid-cols-12 gap-8 lg:gap-8">
        <div className="lg:col-span-4 flex items-center gap-3">
          <span className="rounded-full border border-warning/30 bg-warning/10 px-4 py-1 text-sm font-semibold text-warning">
            Quotation Engine
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        {sidePackages.length > 0 && sidePackagesTitle && (
          <div className="lg:col-span-8 flex items-center gap-3">
            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1 text-sm font-semibold text-green-500">
              {sidePackagesTitle}
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-8">
        <div className="lg:col-span-4 flex flex-col gap-4 w-full">
          {packages.map((pkg) => {
            const save = pkg.original_price - pkg.price;
            return (
              <div
                key={pkg.id}
                onClick={() => togglePackage(pkg)}
                className={`relative cursor-pointer transition-all duration-300 rounded-2xl border p-4 lg:px-5 lg:py-5 lg:min-h-[140px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 min-w-0
                                 ${
                                   selectedPackage?.id === pkg.id
                                     ? 'border-warning bg-warning/10 shadow-[0_0_20px_-5px_hsl(var(--color-warning)/0.2)]'
                                     : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-900'
                                 }`}
              >
                {pkg.is_best_value && (
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
                    <h3 className="text-base sm:text-lg font-bold text-white leading-none">{pkg.name}</h3>
                    <span className="flex items-center gap-1 rounded-full bg-warning/15 border border-warning/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning inline-flex shadow-[0_0_10px_-4px_hsl(var(--color-warning)/0.5)]">
                      <Clock className="w-3 h-3" />
                      {pkg.duration_label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{pkg.description}</p>
                </div>

                <div className="text-left sm:text-right flex-shrink-0 flex flex-col items-start sm:items-end mt-1 sm:mt-0 w-full sm:w-auto border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-sm font-semibold text-zinc-300 line-through decoration-rose-500/70 decoration-2"
                      aria-label={`Original price ${formatINR(pkg.original_price)}`}
                    >
                      {formatINR(pkg.original_price)}
                    </span>
                    <span className="text-2xl font-extrabold text-warning drop-shadow-[0_0_12px_hsl(var(--color-warning)/0.35)]">
                      {formatINR(pkg.price)}
                    </span>
                  </div>
                  {save > 0 && (
                    <div className="flex items-center gap-2 mt-1 sm:mt-2">
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-500/20 inline-block">
                        {Math.round((save / pkg.original_price) * 100)}% OFF
                      </span>
                      <span className="text-xs font-semibold text-emerald-400">
                        Save {formatINR(save)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Side packages (Podcast Studio) — fixed-price, booked directly, so
            they sit beside the quotation without feeding into its total. */}
        {sidePackages.length > 0 && (
          <div className="lg:col-span-8 flex flex-col gap-4">
            {sidePackages.map((pkg) => {
              const save = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;
              return (
                <div
                  key={pkg.name}
                  className={`relative rounded-2xl border p-4 flex flex-col gap-2 transition-all duration-300
                                 ${
                                   pkg.popular
                                     ? 'border-green-500 bg-green-500/10 shadow-[0_0_20px_-5px_rgb(34_197_94/0.2)]'
                                     : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-900'
                                 }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-5 rounded-full bg-green-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-950">
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base sm:text-lg font-bold text-white leading-none">
                        {pkg.name}
                      </h4>
                      <span className="flex items-center gap-1 rounded-full bg-green-500/15 border border-green-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-500 inline-flex">
                        <Clock className="w-3 h-3" />
                        {pkg.durationLabel}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-2">
                        {pkg.originalPrice && (
                          <span
                            className="text-sm font-semibold text-zinc-300 line-through decoration-rose-500/70 decoration-2"
                            aria-label={`Original price ${formatINR(pkg.originalPrice)}`}
                          >
                            {formatINR(pkg.originalPrice)}
                          </span>
                        )}
                        <span className="text-2xl font-extrabold text-green-500 drop-shadow-[0_0_12px_rgb(34_197_94/0.35)]">
                          {formatINR(pkg.price)}
                        </span>
                      </div>
                      {save > 0 && pkg.originalPrice && (
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {Math.round((save / pkg.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Features and the CTA share one row so the card stays as
                      short as the studio package cards opposite it. */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mt-auto">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 flex-1 min-w-0">
                      {pkg.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-1.5 text-xs text-zinc-400"
                        >
                          <Check className="w-3 h-3 text-green-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <a
                      href={generateWhatsAppLink(
                        sidePackagesService,
                        `Hi! I'd like to book the ${pkg.name} package in your studio.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Book the ${pkg.name} package`}
                      className={`shrink-0 w-full sm:w-auto rounded-full px-6 py-2 text-center text-sm font-bold transition-all ${
                        pkg.popular
                          ? 'bg-green-500 text-zinc-950 hover:bg-green-400 hover:shadow-[0_0_30px_-5px_rgb(34_197_94/0.5)]'
                          : 'border border-green-500/40 bg-green-500/10 text-green-500 hover:bg-green-500/20'
                      }`}
                    >
                      Book Session
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add-ons — moved below the package columns so the podcast menu can sit
            beside the quotation list. */}
        <div className="lg:col-span-12 flex flex-col gap-6">
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 h-full">
            <h3 className="text-lg font-bold text-white mb-4">
              Add-ons (Optional)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {addOns.map((addon) => {
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
                      <User
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
            {/* Names the selected package explicitly. These are priced per hour
                and multiplied by that package's duration, so they only make sense
                as part of a booked session — reading them as standalone rentals
                (the /rentals page) is the confusion this wording heads off. */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">
                Add Equipment to Your Studio Session
              </h3>
              <p className="text-zinc-400 mt-1">
                {selectedPackage ? (
                  <>
                    Included in your{' '}
                    <span className="font-semibold text-warning">
                      {selectedPackage.name}
                    </span>{' '}
                    booking and charged for its {packageHours}-hour duration — not
                    a separate rental.{' '}
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-warning">
                      Select a session package above
                    </span>{' '}
                    to add equipment — it is charged for your booked duration, not
                    rented separately.{' '}
                  </>
                )}
                <a
                  href="/rentals"
                  className="underline decoration-dotted underline-offset-2 hover:text-zinc-200"
                >
                  Renting gear to take away?
                </a>
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
                            role="button"
                            tabIndex={selectedPackage ? 0 : -1}
                            aria-disabled={!selectedPackage}
                            className={`w-[240px] shrink-0 rounded-2xl border p-4 flex flex-col gap-3 transition-colors snap-start
                                                            ${
                                                              !selectedPackage
                                                                ? 'border-white/5 bg-zinc-900/30 opacity-50 cursor-not-allowed'
                                                                : isSelected
                                                                  ? 'border-warning bg-warning/10 shadow-[0_0_15px_-5px_hsl(var(--color-warning)/0.15)] cursor-pointer'
                                                                  : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-900 cursor-pointer'
                                                            }`}
                            onClick={() => toggleEquipment(item.id)}
                          >
                            <div className="aspect-video w-full relative rounded-lg bg-zinc-800/50 overflow-hidden">
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
                                {/* With a package chosen the session cost leads and
                                    the hourly rate is the footnote. With none, only
                                    the rate is shown — packageHours would fall back
                                    to 1 and invent a session price that isn't real. */}
                                <span className="flex flex-col leading-tight">
                                  {selectedPackage ? (
                                    <>
                                      <span className="text-warning font-mono text-sm">
                                        +{formatINR(hourly * packageHours)}
                                      </span>
                                      <span className="text-[10px] text-zinc-500 font-mono">
                                        {formatINR(hourly)}/hr × {packageHours}h
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-zinc-500 font-mono text-sm">
                                      {formatINR(hourly)}/hr
                                    </span>
                                  )}
                                </span>
                                <button
                                  aria-label={
                                    !selectedPackage
                                      ? `Select a session package before adding ${item.name}`
                                      : isSelected
                                        ? `Remove ${item.name} from booking`
                                        : `Add ${item.name} to booking`
                                  }
                                  aria-pressed={isSelected}
                                  disabled={!selectedPackage}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors
                                                                        ${isSelected ? 'bg-warning border-warning text-warning-foreground' : 'border-zinc-600 text-zinc-400'} disabled:cursor-not-allowed`}
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
                    Equipment for {packageHours}h session:{' '}
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
        <div className="lg:col-span-12 mt-2">
          <div className="rounded-2xl border border-warning/20 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative md:sticky md:bottom-6 z-10">
            <div className="flex-1 w-full">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Estimated Total
              </h3>
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
                disabled={isLoading || !selectedPackage}
                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-full bg-warning px-8 py-4 text-center font-bold text-warning-foreground transition-all hover:opacity-90 hover:shadow-[0_0_30px_-5px_hsl(var(--color-warning)/0.5)] whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Opening...' : 'Request Booking'}
              </button>
              <p className="text-xs text-zinc-500 mt-3">
                {selectedPackage
                  ? 'No payment required to request'
                  : 'Select a package to request a booking'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
