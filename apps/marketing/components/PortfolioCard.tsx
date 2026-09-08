import Image from 'next/image';
import Link from 'next/link';
import { Database } from '@/lib/database.types';

type Shoot = Database['public']['Tables']['shoots']['Row'] & {
  gallery_images?: Database['public']['Tables']['gallery_images']['Row'][];
};

interface PortfolioCardProps {
  shoot: Shoot;
  coverImage: string;
}

export function PortfolioCard({ shoot, coverImage }: PortfolioCardProps) {
  return (
    <Link
      href={`/photography/${shoot.category?.toLowerCase() || 'general'}`}
      className="block group"
    >
      <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10">
        <Image
          src={coverImage}
          alt={shoot.title || 'Gallery image'}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Glassmorphism gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />

        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
          <div className="flex items-end justify-between">
            <div>
              <span className="mb-3 inline-block rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold tracking-wider text-amber-400 backdrop-blur-md">
                {shoot.category}
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {shoot.title}
              </h3>
              {shoot.description && (
                <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                  {shoot.description}
                </p>
              )}
            </div>

            <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 text-zinc-950 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110 ml-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
