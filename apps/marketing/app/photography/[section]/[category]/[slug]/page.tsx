import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Images, MapPin } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { AlbumGallery } from '@/components/photography/AlbumGallery';
import { AlbumGrid } from '@/components/photography/AlbumGrid';
import { MediaPlaceholder } from '@/components/photography/MediaPlaceholder';
import { BookingBand, Breadcrumbs, PHOTO_WRAP, categoryHeading } from '@/components/photography/PhotoChrome';
import { albumHref, albumTitle, categoryHref, findSection, formatShootDate, getAlbum, getCatalog, getRelatedAlbums } from '@/lib/photography/data';

type Props = { params: Promise<{ section: string; category: string; slug: string }> };

const SITE = 'https://wanderingkite.in';

// Static-by-default: each album renders once and refreshes every 5 minutes (unknown slugs render on first visit).
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, category, slug } = await params;
  const album = await getAlbum(section, category, slug);
  if (!album || !album.category) return { title: 'Album not found' };

  const title = albumTitle(album);
  const where = album.city ? ` in ${album.city.name}` : '';
  const desc = album.story?.slice(0, 158) ?? `${title} — ${categoryHeading(album.category).toLowerCase()}${where} by Wandering Kite.`;
  return {
    title: `${title} — ${categoryHeading(album.category)}${where}`,
    description: desc,
    alternates: { canonical: `${SITE}${albumHref(album)}` },
    openGraph: {
      title: `${title} | Wandering Kite`,
      description: desc,
      url: `${SITE}${albumHref(album)}`,
      images: album.cover_image_url ? [{ url: album.cover_image_url }] : undefined,
    },
  };
}

export default async function AlbumPage({ params }: Props) {
  const { section, category, slug } = await params;
  const [album, cat] = await Promise.all([getAlbum(section, category, slug), getCatalog()]);
  if (!album || !album.category) notFound();

  const sec = findSection(cat, section);
  const related = await getRelatedAlbums(album, 3);
  const title = albumTitle(album);
  const date = formatShootDate(album.shoot_date);
  const corporate = section === 'corporate';
  const c = album.category;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: `${title} — ${categoryHeading(c)}`,
      description: album.story ?? undefined,
      url: `${SITE}${albumHref(album)}`,
      dateCreated: album.shoot_date ?? undefined,
      contentLocation: album.city ? { '@type': 'Place', name: `${album.city.name}, ${album.city.state}` } : undefined,
      creator: { '@id': `${SITE}/#business` },
      image: album.images.slice(0, 10).map((i) => i.url),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Photography', item: `${SITE}/photography` },
        { '@type': 'ListItem', position: 2, name: sec?.name ?? section, item: `${SITE}/photography/${section}` },
        { '@type': 'ListItem', position: 3, name: c.name, item: `${SITE}${categoryHref(c)}` },
        { '@type': 'ListItem', position: 4, name: title, item: `${SITE}${albumHref(album)}` },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        {/* Story hero: copy left, cover right (lg); cover first on phones so the page opens on a picture. */}
        <section data-tone={corporate ? 'sandstone' : undefined} className="border-b border-border">
          <div className={`${PHOTO_WRAP} grid gap-8 pb-12 pt-28 sm:pb-16 sm:pt-32 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pb-20 lg:pt-36`}>
            <div className="order-2 lg:order-1 lg:col-span-5">
              <Breadcrumbs items={[{ label: 'Photography', href: '/photography' }, { label: sec?.name ?? section, href: `/photography/${section}` }, { label: c.name, href: categoryHref(c) }, { label: title }]} />
              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">{categoryHeading(c)}</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]">{title}</h1>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {album.city && (
                  <li className="flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden />{album.city.name}</li>
                )}
                {date && (
                  <li className="flex items-center gap-2"><Calendar className="h-4 w-4" aria-hidden />{date}</li>
                )}
                <li className="flex items-center gap-2"><Images className="h-4 w-4" aria-hidden />{album.images.length} photos</li>
              </ul>
              {album.story && <p className="mt-6 max-w-xl whitespace-pre-line text-base leading-relaxed text-foreground/80">{album.story}</p>}
            </div>
            <div className="order-1 lg:order-2 lg:col-span-7">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-card lg:aspect-[3/2]">
                {album.cover_image_url ? (
                  <Image src={album.cover_image_url} alt={`${title} — ${categoryHeading(c)} by Wandering Kite`} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
                ) : (
                  <MediaPlaceholder className="absolute inset-0" label="Cover coming soon" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Full album — uncropped masonry + lightbox. */}
        <section data-tone={corporate ? 'white' : undefined} aria-label="Album photos">
          <div className={`${PHOTO_WRAP} py-12 sm:py-16 lg:py-20`}>
            {album.images.length > 0 ? (
              <AlbumGallery images={album.images} title={title} />
            ) : (
              <MediaPlaceholder className="aspect-video rounded-2xl" label="Photos coming soon" />
            )}
          </div>
        </section>

        <div data-tone={corporate ? 'white' : undefined}>
          <BookingBand
            title={corporate ? 'Want this for your brand?' : 'Love this style? Let’s plan yours.'}
            subtitle="Share your date, venue and city — we’ll confirm availability and send packages within the day."
            message={`Hi! I loved the "${title}" ${c.name.toLowerCase()} album. I'd like to check availability for my date.`}
          />

          {related.length > 0 && (
            <section aria-labelledby="related-heading" className="border-t border-border">
              <div className={`${PHOTO_WRAP} py-16 sm:py-20`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <h2 id="related-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">More {c.name.toLowerCase()} stories</h2>
                  <Link href={categoryHref(c)} className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
                    <ArrowLeft className="h-4 w-4" aria-hidden /> All {c.name.toLowerCase()}
                  </Link>
                </div>
                <div className="mt-8 lg:mt-12">
                  <AlbumGrid albums={related} />
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer showInstagram={false} tone="sandstone" />
    </>
  );
}
