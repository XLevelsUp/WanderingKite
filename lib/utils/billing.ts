export function calculateRentalCost({
  startTime,
  endTime,
  hourlyRate,
  dailyRate = hourlyRate * 8, // fallback if not set
  weeklyRate = dailyRate * 5, // fallback if not set
  policy
}: {
  startTime: Date;
  endTime: Date;
  hourlyRate: number;
  dailyRate?: number;
  weeklyRate?: number;
  policy: 'HOURLY' | 'SLOT_BASED';
}): number {
  const diffInMs = endTime.getTime() - startTime.getTime();
  const hoursUsed = diffInMs / (1000 * 60 * 60);

  if (policy === 'HOURLY') {
    // Policy 1: Pay for actual time used. No rounding, exact decimals.
    // E.g. 3.5 hours = 3.5 * hourlyRate
    return Number((hoursUsed * hourlyRate).toFixed(2));
  }

  // Policy 2: Slot-Based Billing
  if (hoursUsed <= 4) {
    // Half day is 4 hours or less
    return Number((hoursUsed * hourlyRate).toFixed(2));
  }
  
  if (hoursUsed <= 24) {
    // Exceeds 4 hours up to 1 day -> charge full day
    return dailyRate;
  }

  // Exceeds 1 day -> Round up to nearest full day
  const daysUsed = Math.ceil(hoursUsed / 24);
  
  // Calculate weeks and remaining days
  const weeks = Math.floor(daysUsed / 7);
  const remainingDays = daysUsed % 7;

  // If the cost of the remaining days exceeds the weekly rate, cap it at the weekly rate.
  // For example: Daily rate is ₹500, Weekly rate is ₹2000.
  // If remainingDays is 6, 6 * 500 = ₹3000. We cap it at ₹2000.
  const costForRemainingDays = Math.min(remainingDays * dailyRate, weeklyRate);
  
  const totalCost = (weeks * weeklyRate) + costForRemainingDays;
  return Number(totalCost.toFixed(2));
}
