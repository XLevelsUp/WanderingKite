import React from 'react';

// Podcast is part of the studio: dark theme (tokens in globals.css).
export default function PodcastLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="studio" className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
