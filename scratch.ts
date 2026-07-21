import { computePresentDaysForMonth, calculatePayout } from './lib/payroll-engine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}
import fs from 'fs';
import path from 'path';

// Read .env.local manually to get the token
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const tokenMatch = envContent.match(/INSTAGRAM_ACCESS_TOKEN_WANDERINGKITE=(.*)/);
const token = tokenMatch ? tokenMatch[1].trim() : null;

if (!token) {
  console.error("Token not found in .env.local");
  process.exit(1);
}

const activeToken = token as string;

async function main() {
  console.log("Using Token:", activeToken.substring(0, 15) + "...");

  // 1. Verify and refresh the token to check validity / expiration
  try {
    const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${activeToken}`;
    const res = await fetch(refreshUrl);
    const data = await res.json() as any;
    console.log("\n--- Token Info ---");
    console.log("Status:", res.status);
    console.log("Response Data:", data);
    if (data.expires_in) {
      const days = (data.expires_in / (3600 * 24)).toFixed(2);
      console.log(`Token is valid for: ${data.expires_in} seconds (~${days} days)`);
    }
  } catch (err: any) {
    console.error("Error checking token validity:", err.message);
  }

  // 2. Fetch the latest media items to see what's in there
  try {
    const mediaUrl = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp&limit=50&access_token=${activeToken}`;
    const res = await fetch(mediaUrl);
    const data = await res.json() as any;
    console.log("\n--- Instagram Media Feed (Chronological, limit 50) ---");
    if (!data.data || !Array.isArray(data.data)) {
      console.log("Failed to fetch media or unexpected structure:", data);
      return;
    }

    console.log(`Total items fetched: ${data.data.length}`);
    data.data.slice(0, 10).forEach((item: any, i: number) => {
      console.log(`[${i}] ID: ${item.id}, Type: ${item.media_type}, Time: ${item.timestamp}`);
    });

    const videos = data.data.filter((item: any) => item.media_type === 'VIDEO');
    console.log(`\nTotal videos in fetched items: ${videos.length}`);
    videos.slice(0, 5).forEach((item: any, i: number) => {
      console.log(`Video [${i}] ID: ${item.id}, Time: ${item.timestamp}, URL: ${item.permalink}`);
    });
  } catch (err: any) {
    console.error("Error fetching media:", err.message);
  }
}

async function runTests() {
  console.log('=== PAYROLL ENGINE TESTING ===\n');

  // Let's test for May 2026:
  // - Starts on Friday, May 1st, 2026.
  // - 31 days.
  // - Sundays: May 3, 10, 17, 24, 31 (5 Sundays).
  // - Working days (Mon-Sat): 26 days.
  const month = 5;
  const year = 2026;

  // ─────────────────────────────────────────────────────────────────────────
  // TEST CASE 1: Full Attendance (No Leaves, all 26 working days are present)
  // ─────────────────────────────────────────────────────────────────────────
  const logsFull = [];
  // Populate all working days with PRESENT logs
  for (let day = 1; day <= 31; day++) {
    const date = new Date(year, month - 1, day);
    if (date.getDay() !== 0) {
      logsFull.push({
        date: `${year}-05-${String(day).padStart(2, '0')}`,
        status: 'PRESENT',
      });
    }
  }

  const resFull = computePresentDaysForMonth(month, year, logsFull);
  assert(resFull.presentDays === 30, `Full attendance should normalize to 30 present days (got ${resFull.presentDays})`);
  assert(resFull.lateDays === 0, 'Late days should be 0');

  const payoutFull = calculatePayout({
    baseSalary: 30000,
    month: 5,
    workingDays: 30,
    presentDays: resFull.presentDays,
    lateDays: resFull.lateDays,
    overtimeHours: 0,
    bonusAmount: 0,
    otherDeductions: 0,
    latePenaltyPerMinute: 2,
    avgLateMinutes: 0,
  });

  assert(payoutFull.basePay === 30000, `Base pay should be 30000 (got ${payoutFull.basePay})`);
  assert(payoutFull.unpaidLeaves === 0, `Unpaid leaves should be 0 (got ${payoutFull.unpaidLeaves})`);
  assert(payoutFull.netPayout === 30000, `Net payout should be 30000 (got ${payoutFull.netPayout})`);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST CASE 2: 1 Absent Day on a working day
  // ─────────────────────────────────────────────────────────────────────────
  const logsWithAbsent = [...logsFull];
  // Mark one working day (say, May 1st) as ABSENT
  logsWithAbsent[0] = {
    date: '2026-05-01',
    status: 'ABSENT',
  };

  const resAbsent = computePresentDaysForMonth(month, year, logsWithAbsent);
  assert(resAbsent.presentDays === 29, `1 absent day should result in 29 present days (got ${resAbsent.presentDays})`);

  const payoutAbsent = calculatePayout({
    baseSalary: 30000,
    month: 5,
    workingDays: 30,
    presentDays: resAbsent.presentDays,
    lateDays: resAbsent.lateDays,
    overtimeHours: 0,
    bonusAmount: 0,
    otherDeductions: 0,
    latePenaltyPerMinute: 2,
    avgLateMinutes: 0,
  });

  assert(payoutAbsent.basePay === 29000, `Base pay should be 29000 (got ${payoutAbsent.basePay})`);
  assert(payoutAbsent.unpaidLeaves === 1000, `Unpaid leaves deduction should be 1000 (got ${payoutAbsent.unpaidLeaves})`);
  assert(payoutAbsent.netPayout === 29000, `Net payout should be 29000 (got ${payoutAbsent.netPayout})`);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST CASE 3: 1 Half-Day Day on a working day
  // ─────────────────────────────────────────────────────────────────────────
  const logsWithHalf = [...logsFull];
  // Mark May 1st as HALF_DAY
  logsWithHalf[0] = {
    date: '2026-05-01',
    status: 'HALF_DAY',
  };

  const resHalf = computePresentDaysForMonth(month, year, logsWithHalf);
  assert(resHalf.presentDays === 29.5, `1 half-day should result in 29.5 present days (got ${resHalf.presentDays})`);

  const payoutHalf = calculatePayout({
    baseSalary: 30000,
    month: 5,
    workingDays: 30,
    presentDays: resHalf.presentDays,
    lateDays: resHalf.lateDays,
    overtimeHours: 0,
    bonusAmount: 0,
    otherDeductions: 0,
    latePenaltyPerMinute: 2,
    avgLateMinutes: 0,
  });

  assert(payoutHalf.basePay === 29500, `Base pay should be 29500 (got ${payoutHalf.basePay})`);
  assert(payoutHalf.unpaidLeaves === 500, `Unpaid leaves deduction should be 500 (got ${payoutHalf.unpaidLeaves})`);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST CASE 4: Missing logs (e.g. employee did not log anything)
  // ─────────────────────────────────────────────────────────────────────────
  const resMissing = computePresentDaysForMonth(month, year, []);
  // In a 31-day month like May, there are 5 Sundays.
  // 26 working days without logs are treated as ABSENT (unpaid leaves = 26).
  // So presentDays = 30 - 26 = 4 days.
  assert(resMissing.presentDays === 4, `0 logs should result in 4 present days (got ${resMissing.presentDays})`);

  const payoutMissing = calculatePayout({
    baseSalary: 30000,
    month: 5,
    workingDays: 30,
    presentDays: resMissing.presentDays,
    lateDays: resMissing.lateDays,
    overtimeHours: 0,
    bonusAmount: 0,
    otherDeductions: 0,
    latePenaltyPerMinute: 2,
    avgLateMinutes: 0,
  });

  assert(payoutMissing.basePay === 4000, `Base pay for only Sundays should be 4000 (got ${payoutMissing.basePay})`);
  assert(payoutMissing.unpaidLeaves === 26000, `Unpaid leaves deduction should be 26000 (got ${payoutMissing.unpaidLeaves})`);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST CASE 5: Overtime & Late Penalty with 8-Hour day base
  // ─────────────────────────────────────────────────────────────────────────
  // baseSalary = 30000. dailyRate = 1000. hourlyRate = 125.
  // presentDays = 29.5. basePay = 29500.
  // overtimeHours = 8. overtime = 8 * 125 * 1.5 = 1500.
  // lateDays = 2. avgLateMinutes = 15. latePenaltyPerMinute = 2.
  // latePenalty = 2 * 15 * 2 = 60.
  // otherDeductions = 440.
  // netPayout = 29500 (basePay) + 1500 (overtime) - 60 (late) - 440 (other) = 30500.
  const payoutComplex = calculatePayout({
    baseSalary: 30000,
    month: 5,
    workingDays: 30,
    presentDays: 29.5,
    lateDays: 2,
    overtimeHours: 8,
    bonusAmount: 0,
    otherDeductions: 440,
    latePenaltyPerMinute: 2,
    avgLateMinutes: 15,
  });

  assert(payoutComplex.overtimeAmount === 1500, `Overtime should be 1500 (got ${payoutComplex.overtimeAmount})`);
  assert(payoutComplex.latePenalty === 60, `Late penalty should be 60 (got ${payoutComplex.latePenalty})`);
  assert(payoutComplex.netPayout === 30500, `Net payout should be 30500 (got ${payoutComplex.netPayout})`);

  console.log('\n==================================');
  console.log('ALL PAYROLL LOGIC TESTS COMPLETED SUCCESSFULLY!');
  console.log('==================================');
}

runTests().catch(console.error);
