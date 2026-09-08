import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Camera, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/shared/Footer';

const categoryData = {
  events: {
    title: 'Professional Event & Wedding Photography',
    description:
      'Recognized among the top wedding photographers in Coimbatore, we provide professional event photography to capture your special moments.',
    subCategories: [
      {
        id: 'wedding',
        title: 'Wedding',
        description: 'Full-day coverage with premium editing',
        span: 'sm:col-span-2 sm:row-span-2',
      },
      {
        id: 'engagements',
        title: 'Engagements',
        description: 'Intimate pre-wedding sessions',
        span: 'sm:col-span-1 sm:row-span-1',
      },
      {
        id: 'birthdays',
        title: 'Birthdays',
        description: 'Birthday milestones & parties',
        span: 'sm:col-span-1 sm:row-span-1',
      },
      {
        id: 'house-warming',
        title: 'House Warming',
        description: 'Memorable house warming ceremonies',
        span: 'sm:col-span-1 sm:row-span-1',
      },
      {
        id: 'puberty-ceremonies',
        title: 'Puberty Ceremonies',
        description: 'Traditional puberty ceremony coverage',
        span: 'sm:col-span-2 sm:row-span-1',
      },
    ],
  },
  portraits: {
    title: 'Portrait Photography',
    description: 'Elegant maternity photography, gentle newborn photography, and family portrait sessions tailored for you.',
    subCategories: [
      {
        id: 'family',
        title: 'Family',
        description: 'Studio & outdoor family portrait sessions',
        span: 'sm:col-span-2 sm:row-span-2',
      },
      {
        id: 'maternity',
        title: 'Maternity',
        description: 'Elegant maternity & expecting mother shoots',
        span: 'sm:col-span-1 sm:row-span-1',
      },
      {
        id: 'baby-shoots',
        title: 'Baby Shoots',
        description: 'Safe, gentle newborn photography',
        span: 'sm:col-span-1 sm:row-span-1',
      },
    ],
  },
  corporate: {
    title: 'Corporate & Brand Photography',
    description: 'High-quality corporate photography, product photography, and dynamic brand photography to elevate your business.',
    subCategories: [
      {
        id: 'product',
        title: 'Product',
        description: 'E-commerce & catalogue product photography',
        span: 'sm:col-span-2 sm:row-span-2',
      },
      {
        id: 'cinematic-videos',
        title: 'Cinematic Videos',
        description: 'Brand films & corporate video',
        span: 'sm:col-span-1 sm:row-span-1',
      },
      {
        id: 'social-media',
        title: 'Social Media Content',
        description: 'Platform-ready reels & posts',
        span: 'sm:col-span-1 sm:row-span-1',
      },
      {
        id: 'model-shoots',
        title: 'Model Shoots',
        description: 'Fashion & model portfolio sessions',
        span: 'sm:col-span-2 sm:row-span-1',
      },
      {
        id: 'headshots',
        title: 'Headshots',
        description: 'Professional headshots for teams',
        span: 'sm:col-span-1 sm:row-span-1',
      },
    ],
  },
  commercial: {
    title: 'Commercial Photography & Video',
    description: 'High-concept commercial photographer Tamil Nadu services, delivering top-tier ads and music video production.',
    subCategories: [
      {
        id: 'ads',
        title: 'Ads',
        description: 'High-concept advertisement productions',
        span: 'sm:col-span-2 sm:row-span-2',
      },
      {
        id: 'music-videos',
        title: 'Music Videos',
        description: 'Full-production music videos',
        span: 'sm:col-span-1 sm:row-span-1',
      },
      {
        id: 'short-films',
        title: 'Short Films',
        description: 'Narrative short film production',
        span: 'sm:col-span-1 sm:row-span-1',
      },
    ],
  },
};

type Props = {
  params: Promise<{ mainCategory: string }>;
};

const categoryMetaDescriptions: Record<string, string> = {
  events:
    'Book a professional event photographer in Coimbatore. Wandering Kite covers weddings, engagements, birthdays, house warming & puberty ceremonies with premium editing and fast delivery.',
  portraits:
    'Elegant portrait photography sessions in Coimbatore — family, maternity & newborn baby shoots. Professional photographer, studio & outdoor setups. Get a free quote.',
  corporate:
    'Corporate & brand photography in Coimbatore — product shots, cinematic brand films, social media content, model shoots & professional headshots. 500+ projects delivered.',
  commercial:
    'High-concept commercial photography & video in Coimbatore — advertisement productions, music videos & short films. Contact Wandering Kite for a custom quote.',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryId = resolvedParams.mainCategory;
  const category = categoryData[categoryId as keyof typeof categoryData];

  if (!category) {
    return {
      title: 'Category Not Found | Wandering Kite Studio',
      description: 'The photography category you are looking for does not exist.',
    };
  }

  return {
    title: `${category.title} in Coimbatore | Wandering Kite Studio`,
    description:
      categoryMetaDescriptions[categoryId] ?? category.description,
    openGraph: {
      title: `${category.title} in Coimbatore | Wandering Kite Studio`,
      description:
        categoryMetaDescriptions[categoryId] ?? category.description,
      url: `https://wanderingkite.in/photography/${categoryId}`,
      images: [{ url: '/og-photography.jpg', width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://wanderingkite.in/photography/${categoryId}`,
    },
  };
}

export default async function MainCategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.mainCategory;
  const category = categoryData[categoryId as keyof typeof categoryData];

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background pt-20">
      {/* Header */}
      <header className="sticky top-20 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/photography"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Photography
          </Link>
          <div className="text-right">
            <h2 className="text-lg font-bold">{category.title}</h2>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            {category.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {category.description}
          </p>
        </div>

        {/* Masonry/Bento Grid */}
        <div className="grid auto-rows-[250px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.subCategories.map((sub, idx) => (
            <Link
              key={sub.id}
              href={`/photography/${categoryId}/${sub.id}`}
              className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50 shadow-2xl backdrop-blur-sm transition-transform duration-500 hover:-translate-y-2 ${sub.span}`}
            >
              {/* Local Image */}
              <Image
                src={`/images/photography/${categoryId}/${sub.id}.webp`}
                alt={sub.title}
                fill
                priority={idx < 2}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlays for depth and hover effects */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/0 opacity-0 mix-blend-color-dodge transition-opacity duration-500 group-hover:opacity-100" />

              {/* Content at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                <h3 className="text-2xl font-bold tracking-wide text-white">
                  {sub.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-300 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {sub.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
