// Draft city-page copy (Phase 6). Fallback only: photo_cities.intro in the DB takes precedence once saved (see 00089 migration).
// Deliberately factual — no invented counts or awards. Travel/stay terms match the photography FAQ ("quoted separately").

export type CityCopy = { tagline: string; intro: string[] };

export const CITY_COPY: Record<string, CityCopy> = {
  coimbatore: {
    tagline: 'Our home city — from RS Puram to every mandapam in Kovai.',
    intro: [
      'Coimbatore is where Wandering Kite is based, in RS Puram, so local weddings are close to home for our team. We plan coverage around the rhythm of a Kovai wedding — early muhurthams, busy mandapams and long lines for family portraits.',
      'From temple weddings and community halls to resort receptions on the edge of the city, we plan coverage around your rituals — candid photography, family portraits and films, with edited images delivered within 7–10 days.',
    ],
  },
  chennai: {
    tagline: 'Candid wedding coverage for Chennai’s temples, halls and beach-side venues.',
    intro: [
      'We travel from Coimbatore to Chennai for weddings, receptions and pre-wedding shoots. Chennai weddings move fast — early muhurthams, large guest lists and receptions that run late — so we plan the day with you in advance and bring a team sized to the event.',
      'Whether it is a traditional ceremony in a city kalyana mandapam or an evening reception by the coast, our focus stays the same: honest moments, flattering portraits and a finished album you will want to open again. Travel and stay are quoted separately and transparently.',
    ],
  },
  bangalore: {
    tagline: 'Weddings and receptions across Bangalore, shot with a South Indian eye.',
    intro: [
      'Many of our couples live and work in Bangalore while their families are in Tamil Nadu. We cover Bangalore weddings, receptions and engagement shoots with the same team and style you see in our Coimbatore work.',
      'From banquet-hall receptions to garden and outdoor ceremonies, we plan light, timings and family portraits around your venue. Travel and stay are quoted separately, and edited images are delivered within 7–10 days of the event.',
    ],
  },
  salem: {
    tagline: 'Traditional weddings in Salem, with the hills of Yercaud a short drive away.',
    intro: [
      'Salem weddings are rooted in tradition, and we photograph them that way — every ritual, the elders’ blessings and the quiet family moments in between. Our team travels from Coimbatore for weddings, receptions and family functions across Salem.',
      'For couples who want a pre-wedding or post-wedding shoot, the hills around Yercaud make a beautiful setting close to the city. Travel and stay are quoted separately, and we confirm the full plan with you before the day.',
    ],
  },
  erode: {
    tagline: 'Kongu weddings and family functions across Erode.',
    intro: [
      'Erode is close to our Coimbatore base. We cover Kongu weddings, receptions, puberty ceremonies and house warmings across Erode, with candid coverage and well-planned family portraits.',
      'Because Erode is within easy reach of our Coimbatore base, we can often arrive early for preparations and stay through the last ritual. Any travel costs are quoted upfront, with edited images delivered within 7–10 days.',
    ],
  },
  tiruppur: {
    tagline: 'Weddings, receptions and corporate shoots in Tiruppur.',
    intro: [
      'Tiruppur is a short drive from our studio. We cover weddings, receptions and family events here, as well as product and corporate shoots for local businesses, including the city’s textile and garment brands.',
      'For weddings we plan candid coverage around your rituals and family portraits; for brands we shoot catalogue, product and team photography to your guidelines. Travel is quoted upfront, and edited images arrive within 7–10 days.',
    ],
  },
  pollachi: {
    tagline: 'Village-side weddings and outdoor shoots among Pollachi’s coconut groves.',
    intro: [
      'Pollachi’s green, open countryside makes it one of the most photogenic places near Coimbatore — perfect for traditional village weddings and for pre-wedding and post-wedding outdoor shoots.',
      'We travel from Coimbatore for weddings, receptions and family functions in and around Pollachi, planning the day around natural light and your rituals. Travel is quoted upfront, and edited images are delivered within 7–10 days.',
    ],
  },
};

export const cityCopy = (slug: string, name: string, dbIntro: string | null): CityCopy => {
  const draft = CITY_COPY[slug];
  // DB intro (edited in Supabase) wins; paragraphs separated by blank lines.
  const intro = dbIntro?.trim() ? dbIntro.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : draft?.intro;
  return {
    tagline: draft?.tagline ?? `Wedding and event photography in ${name}.`,
    intro: intro ?? [`We travel from our Coimbatore base to cover weddings, receptions and family events in ${name}. Travel and stay are quoted separately, and edited images are delivered within 7–10 days.`],
  };
};
