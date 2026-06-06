import { MetadataRoute } from 'next';

// ============================================================
// wanderingkite.in — Crawler Governance Policy
// Version: 2.0 | Updated: 2026-06-06
// Strategy: Hybrid 4-Tier Governance
//   Tier 1 — Trusted search engines:   Full access (minus internal paths)
//   Tier 2 — Cooperative AI agents:    Service pages only, rate-limited
//   Tier 3 — LLM training harvesters:  Fully blocked
//   Tier 4 — Unknown agents (default): Fully blocked
// ============================================================

// Paths that are internal and should never be indexed by any crawler
const INTERNAL_DISALLOW = [
  '/_next/',
  '/api/',
  '/admin/',
  '/dashboard/',
  '/auth/',
];

// Service pages cooperative AI agents are permitted to retrieve
const AI_AGENT_ALLOW = [
  '/photography',
  '/rentals',
  '/studiospace',
  '/podcast',
  '/about',
  '/privacy',
  '/terms',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // --------------------------------------------------------
      // TIER 1: Trusted Search Engine Crawlers — Full Access
      // --------------------------------------------------------
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: INTERNAL_DISALLOW,
      },
      {
        userAgent: 'Bingbot',
        allow: ['/'],
        disallow: INTERNAL_DISALLOW,
      },
      {
        userAgent: 'DuckDuckBot',
        allow: ['/'],
        disallow: INTERNAL_DISALLOW,
      },
      {
        userAgent: 'Applebot',
        allow: ['/'],
        disallow: INTERNAL_DISALLOW,
      },
      {
        userAgent: 'Slurp', // Yahoo
        allow: ['/'],
        disallow: INTERNAL_DISALLOW,
      },

      // --------------------------------------------------------
      // TIER 2: Cooperative AI Search Agents — Guided Access
      // These bots surface content in AI-powered search answers.
      // We allow service pages only and guide them via /llms.txt.
      // --------------------------------------------------------
      {
        userAgent: 'PerplexityBot',
        allow: AI_AGENT_ALLOW,
        disallow: ['/'],
      },
      {
        userAgent: 'OAI-SearchBot', // ChatGPT Search / browsing
        allow: AI_AGENT_ALLOW,
        disallow: ['/'],
        crawlDelay: 10,
      },
      {
        userAgent: 'Claude-SearchBot', // Anthropic Search
        allow: AI_AGENT_ALLOW,
        disallow: ['/'],
        crawlDelay: 10,
      },
      {
        userAgent: 'YouBot', // You.com AI search
        allow: AI_AGENT_ALLOW,
        disallow: ['/'],
        crawlDelay: 10,
      },

      // --------------------------------------------------------
      // TIER 3: LLM Training Data Harvesters — FULLY BLOCKED
      // Blocking these does NOT affect search rankings or AI-powered
      // search visibility. It only prevents bulk training ingestion.
      // --------------------------------------------------------
      {
        userAgent: 'GPTBot', // OpenAI training crawler
        disallow: ['/'],
      },
      {
        userAgent: 'ClaudeBot', // Anthropic training crawler
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot', // Common Crawl — feeds major LLM training sets
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended', // Google Gemini/Bard training
        disallow: ['/'],
      },
      {
        userAgent: 'Bytespider', // ByteDance / TikTok LLM training
        disallow: ['/'],
      },
      {
        userAgent: 'Amazonbot', // Amazon Bedrock / Alexa training
        disallow: ['/'],
      },
      {
        userAgent: 'Applebot-Extended', // Apple Intelligence training
        disallow: ['/'],
      },
      {
        userAgent: 'FacebookExternalHit', // Meta AI training
        disallow: ['/'],
      },
      {
        userAgent: 'meta-externalagent', // Meta AI crawler
        disallow: ['/'],
      },
      {
        userAgent: 'Diffbot', // Commercial data extraction
        disallow: ['/'],
      },
      {
        userAgent: 'DataForSeoBot', // SEO data harvester
        disallow: ['/'],
      },

      // --------------------------------------------------------
      // TIER 4: Default — Block All Unrecognized Agents
      // Any crawler not explicitly named above is denied by default.
      // Legitimate crawlers use known user-agent strings.
      // --------------------------------------------------------
      {
        userAgent: '*',
        disallow: ['/'],
      },
    ],

    sitemap: 'https://wanderingkite.in/sitemap.xml',
  };
}
