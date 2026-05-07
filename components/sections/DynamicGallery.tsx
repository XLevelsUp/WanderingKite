"use client";

import { useShoots } from "@/lib/hooks/useShoots";
import { PortfolioCard } from "@/components/PortfolioCard";
import { Camera } from "lucide-react";

export function DynamicGallery() {
  const { shoots, loading, error } = useShoots();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-500">
        <p>Failed to load gallery: {error}</p>
      </div>
    );
  }

  if (!shoots || shoots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Camera className="h-8 w-8 opacity-50" />
        </div>
        <p>No shoots have been published yet.</p>
        <p className="text-sm">Check back soon for our latest work!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shoots.map((shoot) => {
        // Find the first image or use a default placeholder
        const coverImage =
          shoot.gallery_images && shoot.gallery_images.length > 0
            ? shoot.gallery_images[0].url
            : "/images/photography/placeholder.webp"; // Ensure you have a placeholder image

        return (
          <PortfolioCard
            key={shoot.id}
            shoot={shoot}
            coverImage={coverImage}
          />
        );
      })}
    </div>
  );
}
