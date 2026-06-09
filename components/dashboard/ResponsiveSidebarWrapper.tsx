'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface ResponsiveSidebarWrapperProps {
  navContent: React.ReactNode;
  footerContent: React.ReactNode;
  children: React.ReactNode;
}

export function ResponsiveSidebarWrapper({
  navContent,
  footerContent,
  children,
}: ResponsiveSidebarWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sidebarInner = (
    <div className="flex flex-col h-full">
      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {navContent}
      </div>
      {/* Pinned footer — never overlaps nav */}
      <div className="flex-shrink-0 border-t border-primary/12 p-6 bg-[rgba(17,17,22,0.98)]">
        {footerContent}
      </div>
    </div>
  );

  return (
    <div className="flex">
      {/* ── Desktop sidebar (lg+) ─────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[rgba(17,17,22,0.98)] border-r border-primary/12 text-foreground fixed left-0 top-20 bottom-0 backdrop-blur-xl z-30">
        {sidebarInner}
      </aside>

      {/* ── Mobile / Tablet hamburger button ─────────────────── */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-[88px] left-4 z-40 p-2 rounded-xl bg-[rgba(17,17,22,0.95)] border border-primary/20 text-primary/70 hover:text-primary hover:bg-primary/10 transition-all shadow-lg backdrop-blur-sm"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Mobile overlay backdrop ───────────────────────────── */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Mobile / Tablet drawer sidebar ───────────────────── */}
      <aside
        className={`lg:hidden flex flex-col fixed left-0 top-0 bottom-0 w-72 bg-[rgba(13,13,18,0.99)] border-r border-primary/15 text-foreground backdrop-blur-xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 pt-6 border-b border-primary/12">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/50">
            Navigation
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {navContent}
        </div>

        {/* Pinned footer */}
        <div className="flex-shrink-0 border-t border-primary/12 p-6 bg-[rgba(13,13,18,0.99)]">
          {footerContent}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8 min-h-screen bg-[#0A0A0B] w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
