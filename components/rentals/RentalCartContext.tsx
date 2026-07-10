'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';

export interface CartItem {
  id: string;
  name: string;
  selectedPlan: {
    name: string;
    durationHours: number;
    rate: number;
  };
}

interface RentalCartContextType {
  selectedItems: Map<string, CartItem>;
  toggleItem: (item: Omit<CartItem, 'selectedPlan'>, plan: CartItem['selectedPlan']) => void;
  clearCart: () => void;
  subtotal: number;
  discountAmount: number;
  gst: number;
  finalTotal: number;
  billingPolicy: string;
  isRepeatClient: boolean;
  discountPercentage: number;
}

const RentalCartContext = createContext<RentalCartContextType | undefined>(
  undefined
);

export function RentalCartProvider({
  children,
  billingPolicy = 'HOURLY',
  discountPercentage = 0,
  isRepeatClient = false,
}: {
  children: React.ReactNode;
  billingPolicy?: string;
  discountPercentage?: number;
  isRepeatClient?: boolean;
}) {
  const [selectedItems, setSelectedItems] = useState<Map<string, CartItem>>(
    new Map()
  );

  const toggleItem = useCallback((item: Omit<CartItem, 'selectedPlan'>, plan: CartItem['selectedPlan']) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(item.id)) {
        const existing = newMap.get(item.id);
        if (existing?.selectedPlan.name === plan.name) {
          newMap.delete(item.id);
        } else {
          newMap.set(item.id, { ...item, selectedPlan: plan });
        }
      } else {
        newMap.set(item.id, { ...item, selectedPlan: plan });
      }
      return newMap;
    });
  }, []);

  const clearCart = useCallback(() => {
    setSelectedItems(new Map());
  }, []);

  const subtotal = useMemo(() => {
    let total = 0;
    selectedItems.forEach((item) => {
      total += item.selectedPlan.rate;
    });
    return total;
  }, [selectedItems]);

  const discountAmount = useMemo(() => {
    if (isRepeatClient && discountPercentage > 0) {
      return subtotal * (discountPercentage / 100);
    }
    return 0;
  }, [subtotal, isRepeatClient, discountPercentage]);

  const subtotalAfterDiscount = subtotal - discountAmount;
  const gst = subtotalAfterDiscount * 0.18;
  const finalTotal = subtotalAfterDiscount + gst;

  return (
    <RentalCartContext.Provider
      value={{
        selectedItems,
        toggleItem,
        clearCart,
        subtotal,
        discountAmount,
        gst,
        finalTotal,
        billingPolicy,
        isRepeatClient,
        discountPercentage,
      }}
    >
      {children}
    </RentalCartContext.Provider>
  );
}

export function useRentalCart() {
  const context = useContext(RentalCartContext);
  if (context === undefined) {
    throw new Error('useRentalCart must be used within a RentalCartProvider');
  }
  return context;
}
