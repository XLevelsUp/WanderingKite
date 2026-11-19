// Studio pages (studio space, its blog, podcast, studio terms) use the dark theme; everything else stays light.
export const isStudioRoute = (pathname: string | null) =>
  !!pathname && (pathname.startsWith('/studiospace') || pathname.startsWith('/podcast') || pathname.startsWith('/studio-rules'));

// Footer "Legal" links for the current section: studio pages get Studio Terms, photography pages Photography Terms, shared pages both; Rental Terms only while rentals are switched on.
export const legalLinksFor = (pathname: string | null, rentals: boolean) => {
  const studio = { name: 'Studio Terms', href: '/studio-rules' };
  const photo = { name: 'Photography Terms', href: '/photography-terms' };
  const p = pathname ?? '';
  const terms = isStudioRoute(p) ? [studio] : p.startsWith('/photography') ? [photo] : [photo, studio];
  return [{ name: 'Privacy Policy', href: '/privacy' }, ...terms, ...(rentals ? [{ name: 'Rental Terms', href: '/terms' }] : [])];
};
