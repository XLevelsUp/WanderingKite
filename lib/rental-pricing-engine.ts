export type EquipmentCondition = 'NEW' | 'GOOD' | 'FAIR';

export interface PricingConfig {
  repeat_client_discount_percentage: number;
}

export interface EquipmentPricingData {
  id: string;
  hourly_rate: number;
  daily_rate: number;
  weekly_rate: number;
  condition: EquipmentCondition;
}

export interface ClientData {
  id: string;
  isRepeatClient: boolean;
  custom_contracts?: {
    equipment_id: string;
    custom_hourly_rate: number | null;
    custom_daily_rate: number | null;
    custom_weekly_rate: number | null;
  }[];
}

export interface CalculationResult {
  durationHours: number;
  durationDays: number;
  durationWeeks: number;
  baseCharge: number;
  conditionMultiplier: number;
  conditionAdjustment: number;
  discountPercentage: number;
  discountAmount: number;
  finalCharge: number;
  breakdown: string;
}

/**
 * Calculates the rental price based on strict tier rules.
 * 
 * Rules:
 * - HOURLY: strictly hourly. 4 hours + 1 hr = 5 hours charge.
 * - HALF_DAY: if duration <= 4 hrs, charged as 4 hours. If > 4 hrs, charged as full daily rate.
 * - DAILY: strictly daily. Exceeding 24 hours even by 1 hour triggers the next full day. (e.g. 25 hrs = 2 days)
 * - WEEKLY: strictly weekly. Exceeding 7 days triggers the next full week.
 */
export function calculateRentalPrice(
  equipment: EquipmentPricingData,
  client: ClientData | null,
  durationHours: number,
  baseTier: 'HOURLY' | 'HALF_DAY' | 'DAILY' | 'WEEKLY',
  config: PricingConfig
): CalculationResult {
  
  // 1. Determine base rates (apply custom contracts if available)
  let hourly = equipment.hourly_rate;
  let daily = equipment.daily_rate;
  let weekly = equipment.weekly_rate;
  
  const customContract = client?.custom_contracts?.find(c => c.equipment_id === equipment.id);
  if (customContract) {
    if (customContract.custom_hourly_rate != null) hourly = customContract.custom_hourly_rate;
    if (customContract.custom_daily_rate != null) daily = customContract.custom_daily_rate;
    if (customContract.custom_weekly_rate != null) weekly = customContract.custom_weekly_rate;
  }
  
  // 2. Pricing logic based on requested tier
  let baseCharge = 0;
  let breakdown = '';
  
  const totalDays = durationHours / 24;
  const totalWeeks = durationHours / 168; // 24 * 7
  
  if (baseTier === 'HOURLY') {
    // Strictly hourly.
    baseCharge = durationHours * hourly;
    breakdown = `Applied Hourly Rate: ${durationHours} hours @ ₹${hourly}/hr`;
  } else if (baseTier === 'HALF_DAY') {
    // Half day is max 4 hours. Exceeding 4 hours converts to a full day.
    if (durationHours <= 4) {
      baseCharge = 4 * hourly; // Assuming half-day is calculated as 4x hourly.
      breakdown = `Applied Half-Day Rate (<=4 hrs): 4 hours @ ₹${hourly}/hr`;
    } else {
      baseCharge = daily;
      breakdown = `Applied Daily Rate (>4 hrs): Exceeded half-day, charged as 1 full day @ ₹${daily}/day`;
    }
  } else if (baseTier === 'DAILY') {
    // Strictly daily. Any exceedance into next 24h triggers another full day.
    const chargedDays = Math.ceil(totalDays);
    baseCharge = chargedDays * daily;
    breakdown = `Applied Daily Rate: ${chargedDays} days @ ₹${daily}/day`;
  } else if (baseTier === 'WEEKLY') {
    // Strictly weekly. Any exceedance into next 7 days triggers another full week.
    const chargedWeeks = Math.ceil(totalWeeks);
    baseCharge = chargedWeeks * weekly;
    breakdown = `Applied Weekly Rate: ${chargedWeeks} weeks @ ₹${weekly}/week`;
  }
  
  // 3. Condition based adjustment (Multipliers removed per user request)
  let multiplier = 1.0;
  const conditionCharge = baseCharge;
  const conditionAdjustment = 0;
  
  // 4. Repeat client discount
  let discountAmount = 0;
  let discountPercentage = 0;
  if (client?.isRepeatClient) {
    discountPercentage = config.repeat_client_discount_percentage;
    discountAmount = conditionCharge * (discountPercentage / 100);
    breakdown += ` | Repeat Client Discount: -${discountPercentage}%`;
  }
  
  const finalCharge = conditionCharge - discountAmount;
  
  return {
    durationHours,
    durationDays: Number(totalDays.toFixed(2)),
    durationWeeks: Number(totalWeeks.toFixed(2)),
    baseCharge: Math.round(baseCharge),
    conditionMultiplier: multiplier,
    conditionAdjustment: Math.round(conditionAdjustment),
    discountPercentage,
    discountAmount: Math.round(discountAmount),
    finalCharge: Math.round(finalCharge),
    breakdown
  };
}
