'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Camera, Focus, Lightbulb, User, Users, Plus } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';

const PACKAGES = [
    {
        id: 'hourly',
        name: 'Hourly Flex',
        price: 999,
        duration: '/per hr',
        desc: 'Includes Photo/Video Space, 3 Lights, 1 Tripod',
        save: 0,
    },
    {
        id: 'half-day',
        name: 'Half Day',
        price: 3499,
        duration: '/4 hrs',
        desc: 'Perfect for portrait sessions or quick product shoots.',
        save: 497,
    },
    {
        id: 'full-day',
        name: 'Full Day',
        price: 6999,
        duration: '/8 hrs',
        desc: 'Best for elaborate setups, commercial shoots, and music videos.',
        save: 993,
        bestValue: true,
    },
];

const ADD_ONS = [
    { id: 'camera', name: 'Camera', price: 200, unit: 'hr', icon: Camera },
    { id: 'lens', name: 'Lens', price: 100, unit: 'hr', icon: Focus },
    { id: 'lights', name: 'Extra Lights', price: 100, unit: 'hr', icon: Lightbulb },
    { id: 'cameraman', name: 'Pro Cameraman', price: 1000, unit: 'hr', icon: User },
    { id: 'assistant', name: 'Studio Assistant', price: 250, unit: 'hr', icon: Users },
];

export function StudioPricingEngine() {
    const [selectedPackage, setSelectedPackage] = useState(PACKAGES[2]); // Default to Full Day
    const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

    const toggleAddOn = (id: string) => {
        const newSet = new Set(selectedAddOns);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedAddOns(newSet);
    };

    const packageHours = selectedPackage.id === 'hourly' ? 1 : selectedPackage.id === 'half-day' ? 4 : 8;

    const subtotal = useMemo(() => {
        let total = selectedPackage.price;
        selectedAddOns.forEach(id => {
            const addon = ADD_ONS.find(a => a.id === id);
            if (addon) {
                total += (addon.price * packageHours);
            }
        });
        return total;
    }, [selectedPackage, selectedAddOns, packageHours]);

    const gst = subtotal * 0.18;
    const finalTotal = subtotal + gst;

    const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

    const generateBookingMessage = () => {
        const addOnNames = Array.from(selectedAddOns).map(id => ADD_ONS.find(a => a.id === id)?.name).join(', ');
        const addOnString = addOnNames ? ` + [${addOnNames}]` : '';
        return `Hi! I'd like to book: [${selectedPackage.name}]${addOnString}. Total Estimate: ${formatINR(Math.round(finalTotal))} (incl. GST).`;
    };

    return (
        <div className="mb-16">
            <div className="mb-8 flex items-center gap-3">
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-sm font-semibold text-amber-400">
                    Quotation Engine
                </span>
                <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Packages Selection */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    {PACKAGES.map((pkg) => (
                        <div
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg)}
                            className={`relative cursor-pointer transition-all duration-300 rounded-2xl border p-6 flex flex-col sm:flex-row items-center justify-between gap-6
                                ${selectedPackage.id === pkg.id 
                                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)] sm:scale-[1.02]' 
                                    : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-900 sm:hover:scale-[1.01]'}`}
                        >
                            {pkg.bestValue && (
                                <motion.span 
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-3 left-6 rounded-full bg-amber-500 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-950"
                                >
                                    Best Value
                                </motion.span>
                            )}
                            
                            <div className="text-center sm:text-left flex-1">
                                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                                    <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                                        {pkg.duration.replace('/', '')}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-400 mt-1">{pkg.desc}</p>
                            </div>
                            
                            <div className="text-center sm:text-right flex-shrink-0 flex flex-col items-center sm:items-end mt-4 sm:mt-0">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-amber-500">{formatINR(pkg.price)}</span>
                                </div>
                                {pkg.save > 0 && (
                                    <div className="text-xs font-semibold text-emerald-400 mt-2">
                                        Save {formatINR(pkg.save)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add-ons */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 h-full">
                        <h4 className="text-lg font-bold text-white mb-4">Add-ons (Optional)</h4>
                        <div className="space-y-3">
                            {ADD_ONS.map((addon) => {
                                const isSelected = selectedAddOns.has(addon.id);
                                return (
                                    <label 
                                        key={addon.id} 
                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors
                                            ${isSelected ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/5 bg-zinc-900/80 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center space-x-2">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-950" 
                                                    checked={isSelected}
                                                    onChange={() => toggleAddOn(addon.id)}
                                                />
                                            </div>
                                            <addon.icon className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-zinc-500'}`} />
                                            <span className={`text-sm ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{addon.name}</span>
                                        </div>
                                        <span className="text-sm font-mono text-zinc-500">+{formatINR(addon.price)}/{addon.unit}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Summary Full Width Banner */}
                <div className="lg:col-span-12 mt-4">
                    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 sticky bottom-6 z-10">
                        
                        <div className="flex-1 w-full">
                            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Estimated Total</h4>
                            <div className="flex flex-wrap items-end gap-6 sm:gap-12">
                                <div>
                                    <p className="text-zinc-500 text-xs mb-1">Subtotal</p>
                                    <p className="font-mono text-lg text-zinc-300">{formatINR(subtotal)}</p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-xs mb-1">GST (18%)</p>
                                    <p className="font-mono text-lg text-zinc-500">{formatINR(Math.round(gst))}</p>
                                </div>
                                <div>
                                    <p className="text-white text-sm mb-1 font-bold">Total Payable</p>
                                    <AnimatePresence mode="popLayout">
                                        <motion.span 
                                            key={finalTotal}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="text-4xl font-bold text-amber-500 inline-block"
                                        >
                                            {formatINR(Math.round(finalTotal))}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full md:w-auto flex flex-col items-center md:items-end flex-shrink-0">
                            <a
                                href={generateWhatsAppLink('studio', generateBookingMessage())}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full md:w-auto rounded-full bg-amber-500 px-8 py-4 text-center font-bold text-zinc-950 transition-all hover:bg-amber-400 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] whitespace-nowrap"
                            >
                                Request Booking
                            </a>
                            <p className="text-xs text-zinc-500 mt-3">No payment required to request</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
