import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/shared/Footer';
import { AlbumGrid, Pagination } from '@/components/photography/AlbumGrid';
import { CategoryTabs, CityFilter } from '@/components/photography/CategoryTabs';
import { MediaPlaceholder } from '@/components/photography/MediaPlaceholder';
import { BookingBand, Breadcrumbs, PHOTO_WRAP, categoryHeading } from '@/components/photography/PhotoChrome';
import { LegacySubCategory, hasLegacySubCategory, legacySubCategoryMetadata } from '@/components/photography/legacy/LegacySubCategory';
import { SectionSubNav } from '@/components/photography/SectionSubNav';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { categoryHref, findCategory, findCity, findSection, getAlbums, getCatalog, sectionTree, type Catalog, type Category } from '@/lib/photography/data';

type Props = {
  params: Promise<{ section: string; category: string }>;
  searchParams: Promise<{ city?: string; page?: string }>;
};

const SITE = 'https://wanderingkite.in';

// Fallback intro until one is written in the DB (photo_categories.intro). Names the cities we cover, from the catalog.
function defaultIntro(c: Category, cat: Catalog) {
  const cities = cat.cities.map((x) => x.name);
  const where = `${cities.slice(0, -1).join(', ')} and ${cities.at(-1)}`;
  // Noun for the sentence: the heading minus "Photography" ("Baby Photoshoots" → "baby photoshoot").
  const PROPER = new Set(['hindu', 'muslim', 'christian', 'telugu', 'kongu', 'mapillai', 'azhaippu']);
  const n = categoryHeading(c)
    .replace(/\s*photography$/i, '')
    .replace(/photoshoots$/i, 'photoshoot')
    .split(' ')
    .map((w) => (PROPER.has(w.toLowerCase()) ? w : w.toLowerCase()))
    .join(' ');
  switch (c.group_slug) {
    case 'wedding':
      return `Candid, story-led ${n} photography — every ritual, every emotion and the quiet moments in between, delivered as a finished album you'll want to open again and again. We cover weddings across ${where}.`;
    case 'baby':
      return `Gentle, unhurried ${n} sessions planned around your little one's naps and moods, with safe props and soft light. Shot in our studio or at home across ${where}.`;
    case 'gallery':
      return `A curated selection of our ${n} work — the frames couples ask us about most, from weddings and outdoor shoots across ${where}.`;
    case 'events':
      return `${c.name} photography for the occasions that bring your family together — natural, candid coverage of the people, the rituals and the celebration, across ${where}.`;
    default:
      return `${categoryHeading(c)} for brands and businesses — planned around your brief, shot to your brand guidelines and delivered ready to publish. Serving companies across ${where}.`;
  }
}

async function resolve(params: Props['params']) {
  const { section, category } = await params;
  const cat = await getCatalog();
  const sec = findSection(cat, section);
  const c = sec ? findCategory(cat, section, category) : null;
  return { section, category, cat, sec, c };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { section, category, cat, c } = await resolve(params);
  if (!c) return hasLegacySubCategory(section, category) ? legacySubCategoryMetadata(section, category) : { title: 'Not found' };

  const { city, page } = await searchParams;
  const cityName = findCity(cat, city)?.name ?? 'Coimbatore';
  const heading = categoryHeading(c);
  const path = categoryHref(c);
  const pageNum = Number(page) > 1 ? Number(page) : 1;
  return {
    title: `${heading} in ${cityName}`,
    description: (c.intro ?? defaultIntro(c, cat)).slice(0, 158),
    // City filters point at the main category page (cities have their own landing pages); later pages self-canonicalise.
    alternates: { canonical: `${SITE}${path}${pageNum > 1 ? `?page=${pageNum}` : ''}` },
    openGraph: { title: `${heading} | Wandering Kite`, url: `${SITE}${path}` },
  };
}


export default async function CategoryPage({ params, searchParams }: Props) {
  const { section, category, cat, sec, c } = await resolve(params);
  if (!sec || !c) {
    if (hasLegacySubCategory(section, category)) return <LegacySubCategory mainCategory={section} subCategory={category} />;
    notFound();
  }

  const { city: cityParam, page: pageParam } = await searchParams;
  const city = findCity(cat, cityParam)?.slug ?? null;
  const page = Math.max(1, Number(pageParam) || 1);
  const { albums, total, pageCount } = await getAlbums({ categoryId: c.id, city, page });
  // Hero picture: newest album cover in this category (ignoring the city filter), else a placeholder.
  const heroAlbum = city || page > 1 ? (await getAlbums({ categoryId: c.id, pageSize: 1 })).albums[0] : albums[0];

  const tree = sectionTree(cat, section);
  const group = tree.find((g) => g.slug === c.group_slug);
  const heading = categoryHeading(c);
  const intro = c.intro ?? defaultIntro(c, cat);
  const corporate = section === 'corporate';
  const path = categoryHref(c);
  const qs = (p: number, ct: string | null) => {
    const q = new URLSearchParams();
    if (ct) q.set('city', ct);
    if (p > 1) q.set('page', String(p));
    const s = q.toString();
    return s ? `${path}?${s}` : path;
  };
  const cityName = findCity(cat, city)?.name;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: heading,
      description: intro,
      url: `${SITE}${path}`,
      provider: { '@id': `${SITE}/#business` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Photography', item: `${SITE}/photography` },
        { '@type': 'ListItem', position: 2, name: sec.name, item: `${SITE}/photography/${section}` },
        { '@type': 'ListItem', position: 3, name: c.name, item: `${SITE}${path}` },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        {/* Category sub-header (sticky under the main nav; it carries the 80px header offset). */}
        <SectionSubNav
          sectionName={sec.name}
          sectionHref={`/photography/${section}`}
          activeId={c.id}
          bookHref={generateWhatsAppLink('photography', `Hi! I'd like to check availability for ${c.name.toLowerCase()} photography.`)}
          groups={tree.map((g) => ({ slug: g.slug, name: g.name, categories: g.categories.map((x) => ({ id: x.id, name: x.name, href: categoryHref(x), subgroup: x.subgroup ?? null })) }))}
        />
        {/* Hero — Corporate: sandstone; Weddings & Events: porcelain. Top padding 32/48/64 below the sub-header. */}
        <section data-tone={corporate ? 'sandstone' : undefined} className="border-b border-border">
          <div className={`${PHOTO_WRAP} grid gap-8 pb-12 pt-8 sm:pb-16 sm:pt-12 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pb-20 lg:pt-16`}>
            <div className="lg:col-span-7">
              <Breadcrumbs items={[{ label: 'Photography', href: '/photography' }, { label: sec.name, href: `/photography/${section}` }, { label: c.name }]} />
              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">
                {group?.name}
                {c.subgroup ? ` · ${c.subgroup}` : ''}
              </p>
              <h1 className="mt-4 text-3xl font-bold leading-[1.2] tracking-[-0.01em] text-foreground [word-spacing:0.06em] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.18]">{heading}</h1>
              <p className="mt-6 max-w-2xl text-base leading-[1.75] text-foreground/80">{intro}</p>
              <p className="mt-6 text-sm tabular-nums text-muted-foreground">
                {total} {total === 1 ? 'album' : 'albums'}
                {cityName ? ` in ${cityName}` : ''}
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="reveal relative aspect-[4/3] overflow-hidden rounded-2xl bg-card lg:aspect-[4/5]">
                {heroAlbum?.cover_image_url ? (
                  <Image src={heroAlbum.cover_image_url} alt={`${heading} by Wandering Kite`} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                ) : (
                  <MediaPlaceholder className="absolute inset-0" label={`${c.name} cover`} />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Browse: group switcher → category tabs → city filter, then albums. */}
        <section data-tone={corporate ? 'white' : undefined} aria-label={`${c.name} albums`}>
          <div className={`${PHOTO_WRAP} py-12 sm:py-16 lg:py-20`}>
            <div className="space-y-4">
              {tree.length > 1 && (
                <nav aria-label="Groups" className="flex flex-wrap gap-x-6 gap-y-2">
                  {tree.map((g) => {
                    const first = g.categories[0];
                    const on = g.slug === c.group_slug;
                    return first ? (
                      <Link
                        key={g.slug}
                        href={categoryHref(first)}
                        aria-current={on ? 'true' : undefined}
                        className={`border-b-2 pb-1 text-sm font-semibold transition-colors ${on ? 'border-accent-text text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                      >
                        {g.name}
                      </Link>
                    ) : null;
                  })}
                </nav>
              )}
              <CategoryTabs
                label={`${group?.name ?? sec.name} categories`}
                tabs={(group?.categories ?? []).map((x) => ({ href: categoryHref(x), label: x.subgroup ? `${x.subgroup} · ${x.name}` : x.name, active: x.id === c.id }))}
              />
              <CityFilter cities={cat.cities} active={city} hrefFor={(ct) => qs(1, ct)} />
            </div>

            <div className="mt-12">
              <AlbumGrid albums={albums} showCategory={false} emptyLabel={`${c.name} albums coming soon`} whatsappMessage={`Hi! I'd like to see your recent ${c.name.toLowerCase()} work${cityName ? ` in ${cityName}` : ''}.`} />
              <Pagination page={page} pageCount={pageCount} hrefFor={(p) => qs(p, city)} />
            </div>
          </div>
        </section>

        <div data-tone={corporate ? 'white' : undefined}>
          <BookingBand
            title={corporate ? `Planning ${c.name.toLowerCase()}?` : `Planning your ${c.name.toLowerCase()}${cityName ? ` in ${cityName}` : ''}?`}
            subtitle="Tell us the date and venue — we'll confirm availability and share packages within the day."
            message={`Hi! I'm interested in ${heading.toLowerCase()}${cityName ? ` in ${cityName}` : ''}. Is my date available?`}
          />
        </div>
      </main>
      <Footer showInstagram={false} tone="sandstone" />
    </>
  );
}
