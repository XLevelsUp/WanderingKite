/**
 * Responsive sources for the /photography hero film poster (the page's LCP image). Image optimisation is off
 * site-wide, so phones get a pre-made 800px copy (name-w800.webp, made with sharp) and desktops the 1280px original.
 * Shared by the <img> in HeroFilm and the page's preload, so the browser preloads the copy it will actually use.
 */
export const HERO_POSTER = '/images/photography/weddings-film-poster.webp';
export const HERO_POSTER_SIZES = '(min-width: 1024px) 55vw, 92vw';
export const heroPosterSrcSet = (poster: string) => `${poster.replace(/\.webp$/, '-w800.webp')} 800w, ${poster} 1280w`;
