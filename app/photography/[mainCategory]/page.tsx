import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Camera, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Footer } from "@/components/shared/Footer";

const categoryData = {
  events: {
    title: "Event Photography",
    description:
      "Professional event photography in Coimbatore. We capture your special moments.",
    subCategories: [
      {
        id: "wedding",
        title: "Wedding",
        description: "Full-day coverage with premium editing",
        span: "col-span-2 row-span-2",
      },
      {
        id: "engagements",
        title: "Engagements",
        description: "Intimate pre-wedding sessions",
        span: "col-span-1 row-span-1",
      },
      {
        id: "birthdays",
        title: "Birthdays",
        description: "Birthday milestones & parties",
        span: "col-span-1 row-span-1",
      },
    ],
  },
  portraits: {
    title: "Portrait Sessions",
    description: "Elegant portrait photography tailored for you.",
    subCategories: [
      {
        id: "family",
        title: "Family",
        description: "Studio & outdoor family portrait sessions",
        span: "col-span-2 row-span-2",
      },
      {
        id: "maternity",
        title: "Maternity",
        description: "Elegant maternity & expecting mother shoots",
        span: "col-span-1 row-span-1",
      },
      {
        id: "baby-shoots",
        title: "Baby Shoots",
        description: "Safe, gentle newborn photography",
        span: "col-span-1 row-span-1",
      },
    ],
  },
  corporate: {
    title: "Corporate & Brand",
    description: "High-quality corporate and brand photography services.",
    subCategories: [
      {
        id: "product",
        title: "Product",
        description: "E-commerce & catalogue product photography",
        span: "col-span-2 row-span-2",
      },
      {
        id: "cinematic-videos",
        title: "Cinematic Videos",
        description: "Brand films & corporate video",
        span: "col-span-1 row-span-1",
      },
      {
        id: "social-media",
        title: "Social Media Content",
        description: "Platform-ready reels & posts",
        span: "col-span-1 row-span-1",
      },
      {
        id: "model-shoots",
        title: "Model Shoots",
        description: "Fashion & model portfolio sessions",
        span: "col-span-2 row-span-1",
      },
      {
        id: "headshots",
        title: "Headshots",
        description: "Professional headshots for teams",
        span: "col-span-1 row-span-1",
      },
    ],
  },
  commercial: {
    title: "Commercial Productions",
    description: "High-concept commercial photography and video productions.",
    subCategories: [
      {
        id: "ads",
        title: "Ads",
        description: "High-concept advertisement productions",
        span: "col-span-2 row-span-2",
      },
      {
        id: "music-videos",
        title: "Music Videos",
        description: "Full-production music videos",
        span: "col-span-1 row-span-1",
      },
      {
        id: "short-films",
        title: "Short Films",
        description: "Narrative short film production",
        span: "col-span-1 row-span-1",
      },
    ],
  },
};

type Props = {
  params: Promise<{ mainCategory: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryId = resolvedParams.mainCategory;
  const category = categoryData[categoryId as keyof typeof categoryData];

  if (!category) {
    return {
      title: "Category Not Found | Wandering Kite Studio",
    };
  }

  return {
    title: `${category.title} in Coimbatore | Wandering Kite Studio`,
    description: category.description,
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
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {category.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {category.description}
          </p>
        </div>

        {/* Masonry/Bento Grid */}
        <div className="grid auto-rows-[250px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.subCategories.map((sub) => (
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
