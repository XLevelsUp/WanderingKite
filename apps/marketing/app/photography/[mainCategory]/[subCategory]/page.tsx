import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GalleryTemplate } from '@/components/sections/GalleryTemplate';
import { getShootsBySubCategory } from '@/actions/shoots-public';
import { Footer } from '@/components/shared/Footer';

const categoryData = {
  events: {
    title: 'Event Photography',
    subCategories: [
      {
        id: 'wedding',
        title: 'Wedding',
        description: 'Full-day coverage with premium editing',
      },
      {
        id: 'engagements',
        title: 'Engagements',
        description: 'Intimate pre-wedding sessions',
      },
      {
        id: 'birthdays',
        title: 'Birthdays',
        description: 'Birthday milestones & parties',
      },
      {
        id: 'house-warming',
        title: 'House Warming',
        description: 'Memorable house warming ceremonies',
      },
      {
        id: 'puberty-ceremonies',
        title: 'Puberty Ceremonies',
        description: 'Traditional puberty ceremony coverage',
      },
    ],
  },
  portraits: {
    title: 'Portrait Sessions',
    subCategories: [
      {
        id: 'family',
        title: 'Family',
        description: 'Studio & outdoor family portrait sessions',
      },
      {
        id: 'maternity',
        title: 'Maternity',
        description: 'Elegant maternity & expecting mother shoots',
      },
      {
        id: 'baby-shoots',
        title: 'Baby Shoots',
        description: 'Safe, gentle newborn photography',
      },
    ],
  },
  corporate: {
    title: 'Corporate & Brand',
    subCategories: [
      {
        id: 'product',
        title: 'Product',
        description: 'E-commerce & catalogue product photography',
      },
      {
        id: 'cinematic-videos',
        title: 'Cinematic Videos',
        description: 'Brand films & corporate video',
      },
      {
        id: 'social-media',
        title: 'Social Media Content',
        description: 'Platform-ready reels & posts',
      },
      {
        id: 'model-shoots',
        title: 'Model Shoots',
        description: 'Fashion & model portfolio sessions',
      },
      {
        id: 'headshots',
        title: 'Headshots',
        description: 'Professional headshots for teams',
      },
    ],
  },
  commercial: {
    title: 'Commercial Productions',
    subCategories: [
      {
        id: 'ads',
        title: 'Ads',
        description: 'High-concept advertisement productions',
      },
      {
        id: 'music-videos',
        title: 'Music Videos',
        description: 'Full-production music videos',
      },
      {
        id: 'short-films',
        title: 'Short Films',
        description: 'Narrative short film production',
      },
    ],
  },
};

type Props = {
  params: Promise<{ mainCategory: string; subCategory: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { mainCategory, subCategory } = resolvedParams;
  const category = categoryData[mainCategory as keyof typeof categoryData];
  const sub = category?.subCategories.find((s) => s.id === subCategory);

  if (!category || !sub) {
    return {
      title: 'Category Not Found | Wandering Kite Studio',
      description: 'The photography category you are looking for does not exist.',
    };
  }

  return {
    title: `Professional ${sub.title} Photographer in Coimbatore | Elegant ${sub.title} - Wandering Kite`,
    description: `Professional ${sub.title} photography in Coimbatore. ${sub.description}. View our portfolio and photography packages price.`,
    keywords: [
      `Best ${sub.title} Photographer in Coimbatore`,
      `${sub.title} photography packages price`,
      `${sub.title} Coimbatore`,
      `Professional ${sub.title} India`,
      mainCategory,
    ],
    openGraph: {
      title: `Professional ${sub.title} Photographer in Coimbatore`,
      description: `Professional ${sub.title} photography in Coimbatore. ${sub.description}.`,
      images: ['/og-photography.jpg'],
    },
    alternates: {
      canonical: `https://wanderingkite.in/photography/${mainCategory}/${subCategory}`,
    },
  };
}

export default async function SubCategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const { mainCategory, subCategory } = resolvedParams;
  const category = categoryData[mainCategory as keyof typeof categoryData];
  const sub = category?.subCategories.find((s) => s.id === subCategory);

  if (!category || !sub) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: `${sub.title} Portfolio`,
    description: `Gallery of ${sub.title} by Wandering Kite Studio.`,
    url: `https://wanderingkite.in/photography/${mainCategory}/${subCategory}`,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Wandering Kite Studio',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Coimbatore',
        addressRegion: 'Tamil Nadu',
        addressCountry: 'IN',
      },
    },
  };

  const shoots = await getShootsBySubCategory(subCategory);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* GalleryTemplate expects a category object, we map our sub object to it */}
      <GalleryTemplate
        mainCategory={mainCategory}
        subCategory={subCategory}
        category={{
          id: sub.id,
          title: sub.title,
          category: category.title,
          focus: sub.description,
        }}
        shoots={shoots}
      />
      <Footer />
    </>
  );
}
