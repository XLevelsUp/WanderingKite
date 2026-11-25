import { siteConfig } from '@/config/site';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** schema.org OpeningHoursSpecification built from siteConfig.hours. */
export const openingHoursSchema = () =>
  siteConfig.hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days.map((d) => DAY_NAMES[d]),
    opens: h.opens,
    closes: h.closes,
  }));

const to12h = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return m ? `${hh}:${String(m).padStart(2, '0')} ${suffix}` : `${hh} ${suffix}`;
};

/** Human lines, e.g. ["Mon–Fri 9 AM – 6 PM", "Sat 10 AM – 5 PM"]. */
export const openingHoursLines = () =>
  siteConfig.hours.map((h) => {
    const days = h.days.length === 7 ? 'Every day' : h.days.length > 1 ? `${SHORT[h.days[0]]}–${SHORT[h.days[h.days.length - 1]]}` : SHORT[h.days[0]];
    return `${days} ${to12h(h.opens)} – ${to12h(h.closes)}`;
  });

/** Whether the studio is open right now, evaluated in IST (the studio's time zone), regardless of the visitor's clock. */
export function isOpenNow(now = new Date()) {
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60_000);
  const day = ist.getDay();
  const mins = ist.getHours() * 60 + ist.getMinutes();
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return siteConfig.hours.some((h) => h.days.includes(day) && mins >= toMin(h.opens) && mins < toMin(h.closes));
}
