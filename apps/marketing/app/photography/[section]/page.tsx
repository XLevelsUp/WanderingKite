import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SectionPage } from '@/components/photography/SectionPage';
import { CITY_PREFIX, CityPage, cityPageTitle } from '@/components/photography/CityPage';
import { LegacyMainCategory, hasLegacyMainCategory, legacyMainCategoryMetadata } from '@/components/photography/legacy/LegacyMainCategory';
import { cityCopy } from '@/lib/photography/city-copy';
import { findCity, findSection, getAlbums, getCatalog } from '@/lib/photography/data';

type Props = { params: Promise<{ section: string }>; searchParams: Promise<{ page?: string }> };

const SITE = 'https://www.wanderingkite.in';

const META: Record<string, { title: string; description: string }> = {
  weddings: {
    title: 'Wedding & Event Photographer in Coimbatore',
    description: 'Candid wedding, baby, maternity and family event photography in Coimbatore, Chennai, Bangalore, Salem, Erode, Tiruppur and Pollachi. Browse real albums and check your date.',
  },
  corporate: {
    title: 'Corporate Photography & Video Production in Coimbatore',
    description: 'Corporate events, conferences, headshots, product photography, ads, music videos and short films for brands across Coimbatore, Chennai and Bangalore.',
  },
};

// Section and city pages are cached and refresh every 5 minutes.
export const revalidate = 300;

/** /photography/wedding-photographer-in-{city} → the city, if it's in the catalog. */
async function cityFor(segment: string) {
  if (!segment.startsWith(CITY_PREFIX)) return null;
  return findCity(await getCatalog(), segment.slice(CITY_PREFIX.length));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;

  const city = await cityFor(section);
  if (city) {
    const copy = cityCopy(city.slug, city.name, city.intro);
    const url = `${SITE}/photography/${CITY_PREFIX}${city.slug}`;
    const description = copy.intro[0].slice(0, 158);
    // A city page with no published albums is thin content: keep it reachable but out of the index until there's local work to show.
    const { total } = await getAlbums({ city: city.slug, pageSize: 1 });
    return {
      title: `${cityPageTitle(city)} | Candid Wedding & Event Photography`,
      description,
      ...(total === 0 ? { robots: { index: false, follow: true } } : {}),
      alternates: { canonical: url },
      openGraph: { title: `${cityPageTitle(city)} | Wandering Kite`, description, url },
    };
  }

  const sec = findSection(await getCatalog(), section);
  if (!sec) return hasLegacyMainCategory(section) ? legacyMainCategoryMetadata(section) : { title: 'Not found' };
  const m = META[section] ?? { title: sec.name, description: `${sec.name} photography by Wandering Kite.` };
  return {
    ...m,
    alternates: { canonical: `${SITE}/photography/${section}` },
    openGraph: { ...m, url: `${SITE}/photography/${section}` },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { section } = await params;

  const city = await cityFor(section);
  if (city) {
    // Only city pages read ?page, so section pages stay statically cached.
    const page = Math.max(1, Number((await searchParams).page) || 1);
    return <CityPage city={city} page={page} />;
  }

  const sec = findSection(await getCatalog(), section);
  if (sec) return <SectionPage section={sec} />;
  // Old main categories (/photography/events, /portraits, /commercial) until Phase 7 redirects.
  if (hasLegacyMainCategory(section)) return <LegacyMainCategory categoryId={section} />;
  notFound();
}
