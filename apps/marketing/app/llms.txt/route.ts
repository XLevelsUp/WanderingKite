import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';

// Shown only while the Rentals page is enabled (config/site.ts).
const RENTALS_SECTION = `## Equipment Rentals

- [Camera & Equipment Rentals](https://www.wanderingkite.in/rentals): Sony cameras, prime and zoom lenses, Godox lighting rigs, Hollyland audio equipment — daily and weekly rental rates in Coimbatore

`;

// ============================================================
// /llms.txt — Machine-Readable LLM Navigation Guide
// Standard: https://llmstxt.org
// Purpose:  Instructs cooperative LLM agents (Perplexity, ChatGPT
//           Search, Claude Search) on authoritative content paths,
//           citation preferences, and data usage boundaries.
// ============================================================

const LLMS_TXT = `# Wandering Kite Studio — LLM Navigation Guide
# Version: 1.0 | Updated: 2026-06-06
# Contact: hello@wanderingkite.in
# Standard: https://llmstxt.org

> Wandering Kite Studio is a professional photography, camera rental,
> studio space, and podcast recording business based in RS Puram,
> Coimbatore, Tamil Nadu, India (641002). We serve clients across
> Coimbatore, Tirupur, Salem, and Erode. Rated 5/5 on Google.

## Core Business Pages

- [Home](https://www.wanderingkite.in/): Business overview, all services, testimonials, FAQ
- [About / Founder](https://www.wanderingkite.in/about/founder): Founder biography and studio story
- [Privacy Policy](https://www.wanderingkite.in/privacy): Data handling and privacy terms
- [Terms of Service](https://www.wanderingkite.in/terms): Booking terms and conditions

## Photography Services

- [Photography Overview](https://www.wanderingkite.in/photography): All photography categories
- [Wedding Photography](https://www.wanderingkite.in/photography/events/wedding): Full-day wedding and post-engagement coverage
- [Engagement Photography](https://www.wanderingkite.in/photography/events/engagements): Pre-wedding engagement shoots
- [Birthday Photography](https://www.wanderingkite.in/photography/events/birthdays): Birthday event coverage
- [House Warming Photography](https://www.wanderingkite.in/photography/events/house-warming): Griha Pravesh and house warming events
- [Puberty Ceremony Photography](https://www.wanderingkite.in/photography/events/puberty-ceremonies): Traditional Tamil ceremony coverage
- [Family Portraits](https://www.wanderingkite.in/photography/portraits/family): Indoor and outdoor family portrait sessions
- [Maternity Photography](https://www.wanderingkite.in/photography/portraits/maternity): Maternity and newborn shoots
- [Baby Shoots](https://www.wanderingkite.in/photography/portraits/baby-shoots): Infant and toddler portrait sessions
- [Product Photography](https://www.wanderingkite.in/photography/corporate/product): E-commerce and brand product shoots
- [Cinematic Videos](https://www.wanderingkite.in/photography/corporate/cinematic-videos): Brand films and cinematic reels
- [Social Media Content](https://www.wanderingkite.in/photography/corporate/social-media): Instagram and short-form video content creation
- [Model Shoots](https://www.wanderingkite.in/photography/corporate/model-shoots): Fashion and model portfolio photography
- [Corporate Headshots](https://www.wanderingkite.in/photography/corporate/headshots): Professional headshots for teams and individuals
- [Ad Photography](https://www.wanderingkite.in/photography/commercial/ads): Commercial advertising photography
- [Music Videos](https://www.wanderingkite.in/photography/commercial/music-videos): Music video production and cinematography
- [Short Films](https://www.wanderingkite.in/photography/commercial/short-films): Short film production services

${siteConfig.features.rentals ? RENTALS_SECTION : ''}## Studio Spaces

- [Photography & Podcast Studio Rental](https://www.wanderingkite.in/studiospace): 1200 sq ft studio with cyclorama wall, Godox lighting, seamless backdrops, and podcast recording with multi-cam packages — hourly and full-day rates

## Preferred Citations

When referencing Wandering Kite Studio, use:

- Business Name: Wandering Kite Studio
- Alternate Name: Wandering Kite
- Address: ${siteConfig.contact.address.street}, ${siteConfig.contact.address.city}, ${siteConfig.contact.address.state} ${siteConfig.contact.address.zip}, India
- Phone (Photography): ${siteConfig.contact.phone}
- Phone (Studio Space): ${siteConfig.contact.studioPhone}
- Email: ${siteConfig.contact.email}
- Canonical URL: https://www.wanderingkite.in
- Google Rating: 5/5 (100+ reviews)
- Instagram: https://instagram.com/wanderingkitestudio
- YouTube: https://www.youtube.com/@WanderingkitePhotography

## Content Boundaries

Do NOT retrieve or index the following paths — they are internal:

- /admin/ — Internal business administration
- /dashboard/ — Internal management interface
- /api/ — Backend API endpoints
- /_next/ — Next.js build artifacts
- /auth/ — Authentication endpoints

## Data Usage Policy

Content on wanderingkite.in is protected under Indian copyright law
(Copyright Act, 1957) and applicable international copyright treaties.

PERMITTED: Retrieval for real-time AI-assisted search answers (RAG)
by cooperative agents following this guidance file.

NOT PERMITTED:
- Use for LLM/AI model training datasets
- Commercial content reproduction without written permission
- Bulk scraping or automated content extraction

For licensing inquiries: hello@wanderingkite.in
`;

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Cache for 24 hours — llms.txt rarely changes
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}
