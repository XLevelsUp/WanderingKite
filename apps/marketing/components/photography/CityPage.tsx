import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { StudioFAQ } from '@/components/studio/StudioFAQ';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { AlbumGrid, Pagination } from './AlbumGrid';
import { MediaPlaceholder } from './MediaPlaceholder';
import { BookingBand, Breadcrumbs, CitiesBand, PHOTO_WRAP } from './PhotoChrome';
import { cityCopy } from '@/lib/photography/city-copy';
import { categoryHref, cityHref, getAlbums, getCatalog, sectionTree, type Album, type City } from '@/lib/photography/data';

const SITE = 'https://wanderingkite.in';

/** Prefix used by city landing pages: /photography/wedding-photographer-in-{city}. */
export const CITY_PREFIX = 'wedding-photographer-in-';

export const cityPageTitle = (city: City) => `Wedding Photographer in ${city.name}`;

// City FAQ — answers reuse the photography FAQ's terms (booking lead time, travel quoted separately, 7–10 day delivery).
const cityFaqs = (city: City) => [
  {
    question: `Do you travel to ${city.name} for weddings?`,
    answer:
      city.slug === 'coimbatore'
        ? 'Yes — Coimbatore is our home base (RS Puram), and we cover weddings and events across the city.'
        : `Yes. We are based in Coimbatore and travel to ${city.name} for weddings, receptions and family events. Travel and accommodation costs are additional and will be included in your custom quote.`,
  },
  {
    question: `How far in advance should I book for a wedding in ${city.name}?`,
    answer:
      'For events and weddings, we recommend booking at least 30 days in advance. Popular muhurtham dates fill up early, so message us as soon as your date is fixed.',
  },
  {
    question: 'When will we receive our photos?',
    answer: 'Within 7-10 days, you receive professionally edited high-resolution images via cloud link.',
  },
];

/** Collage of up to three photos from this city's albums (falls back to the newest albums, then placeholders). */
function Collage({ albums }: { albums: Album[] }) {
  const tile = (a: Album | undefined, i: number, cls: string) => (
    <div key={i} className={`relative overflow-hidden rounded-2xl bg-card ${cls}`}>
      {a?.cover_image_url ? (
        <Image src={a.cover_image_url} alt="" fill priority={i === 0} sizes={i === 0 ? '(min-width: 1024px) 30vw, 66vw' : '(min-width: 1024px) 15vw, 33vw'} className="kenburns object-cover" style={{ animationDelay: `${i * 120}ms` }} />
      ) : (
        <MediaPlaceholder className="absolute inset-0" />
      )}
    </div>
  );
  return (
    <div className="grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-2 sm:gap-4 lg:aspect-[5/6] lg:max-h-[min(78svh,44rem)] lg:w-full">
      {tile(albums[0], 0, 'col-span-2 row-span-2')}
      {tile(albums[1], 1, '')}
      {tile(albums[2], 2, '')}
    </div>
  );
}

export async function CityPage({ city, page }: { city: City; page: number }) {
  const [cat, local, newest] = await Promise.all([
    getCatalog(),
    getAlbums({ city: city.slug, page, pageSize: 9 }),
    getAlbums({ pageSize: 3 }),
  ]);
  const copy = cityCopy(city.slug, city.name, city.intro);
  const heroAlbums = [...local.albums, ...newest.albums.filter((a) => !local.albums.some((l) => l.id === a.id))].slice(0, 3);
  const path = `/photography/${CITY_PREFIX}${city.slug}`;
  const faqs = cityFaqs(city);
  // "What we cover": every category, grouped, each pre-filtered to this city.
  const groups = cat.sections.flatMap((s) => sectionTree(cat, s.slug).map((g) => ({ ...g, sectionName: s.name })));

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${cityPageTitle(city)} | Wandering Kite`,
      serviceType: 'Wedding and event photography',
      provider: { '@id': `${SITE}/#business` },
      areaServed: { '@type': 'City', name: city.name, containedInPlace: { '@type': 'State', name: city.state } },
      url: `${SITE}${path}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Photography', item: `${SITE}/photography` },
        { '@type': 'ListItem', position: 2, name: cityPageTitle(city), item: `${SITE}${path}` },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        {/* ── Hero ── */}
        <section className="overflow-hidden border-b border-border">
          <div className={`${PHOTO_WRAP} grid gap-8 pb-12 pt-28 sm:pb-16 sm:pt-32 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pb-20 lg:pt-36`}>
            <div className="lg:col-span-6">
              <Breadcrumbs items={[{ label: 'Photography', href: '/photography' }, { label: city.name }]} />
              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">
                {city.name}, {city.state}
              </p>
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]">
                {cityPageTitle(city)}
                <span className="mt-2 block text-xl font-semibold text-accent-text sm:text-2xl">{copy.tagline}</span>
              </h1>
              <div className="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-foreground/80">
                {copy.intro.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href={generateWhatsAppLink('photography', `Hi! I'm planning a wedding/event in ${city.name}. Is my date available?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cta px-6 text-sm font-semibold text-cta-foreground transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Check your date in {city.name}
                </a>
                <a
                  href="#city-albums"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-foreground/30 px-6 text-sm font-semibold text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  See our work
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
            <div className="lg:col-span-6">
              <Collage albums={heroAlbums} />
            </div>
          </div>
        </section>

        {/* ── Albums shot in this city ── */}
        <section id="city-albums" aria-labelledby="city-albums-heading" className="scroll-mt-20">
          <div className={`${PHOTO_WRAP} py-16 sm:py-20 lg:py-24`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Portfolio</p>
            <h2 id="city-albums-heading" className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Stories from {city.name}</h2>
            <div className="mt-8 lg:mt-12">
              <AlbumGrid
                albums={local.albums}
                emptyLabel={`${city.name} albums coming soon`}
                whatsappMessage={`Hi! Could you share some of your recent work in ${city.name}?`}
              />
              <Pagination page={page} pageCount={local.pageCount} hrefFor={(p) => (p > 1 ? `${path}?page=${p}` : path)} />
            </div>
          </div>
        </section>

        {/* ── What we cover, each link pre-filtered to this city ── */}
        <section aria-labelledby="city-cover-heading" className="border-t border-border">
          <div className={`${PHOTO_WRAP} py-16 sm:py-20`}>
            <h2 id="city-cover-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What we cover in {city.name}</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-5 lg:gap-8">
              {groups.map((g) => (
                <div key={`${g.section_slug}-${g.slug}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">{g.name}</p>
                  {/* Wrapping chips on phones/tablets (compact); plain list from lg. */}
                  <ul className="mt-4 flex flex-wrap gap-2 lg:block lg:space-y-2">
                    {g.categories.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`${categoryHref(c)}?city=${city.slug}`}
                          className="inline-flex h-9 items-center rounded-full border border-border px-3 text-sm text-foreground transition-colors hover:border-foreground lg:h-auto lg:rounded-none lg:border-0 lg:px-0 lg:text-base lg:underline lg:decoration-transparent lg:underline-offset-4 lg:hover:decoration-foreground"
                        >
                          {c.subgroup ? `${c.subgroup} · ${c.name}` : c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <StudioFAQ faqs={faqs} service="photography" />
        <CitiesBand cities={cat.cities.filter((c) => c.slug !== city.slug)} title="We also shoot in" />
        <BookingBand
          title={`Planning something in ${city.name}?`}
          subtitle="Share your date and venue — we’ll confirm availability, travel and packages within the day."
          message={`Hi! I'm planning a wedding/event in ${city.name}. Is my date available?`}
        />
      </main>
      <Footer showInstagram={false} tone="sandstone" />
    </>
  );
}

export { cityHref };
