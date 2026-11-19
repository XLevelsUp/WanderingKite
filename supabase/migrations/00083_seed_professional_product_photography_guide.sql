-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "Why Professional Product Photography Matters for Your Brand"
--
-- Photography-section blog post (section = 'PHOTOGRAPHY', category =
-- 'COMMERCIAL_BRAND'). COMMERCIAL_BRAND already exists from 00066, so like
-- 00082 this needs no ALTER TYPE first.
--
-- Same idempotent-on-slug pattern as 00074–00082: children are deleted and
-- reinserted on re-run, matching the admin form's save behaviour.
--
-- Images: the featured image and the two in-post images (S2, S4) are left
-- NULL — upload them in the dashboard (Blog → edit). Alt text is stored now
-- so it is in place the moment an image is set. The brief suggests a lit
-- product shot on a seamless backdrop for the hero, an amateur-vs-pro
-- comparison for S2 and a behind-the-scenes studio setup for S4; the brief's
-- captions have no column on blog_sections, so they are not stored.
--
-- CTA targets: /photography/corporate/product is the live product-photography
-- route — `corporate` is a mainCategory under /photography (there is no
-- standalone /corporate route) and `product` is one of its subCategory ids,
-- both validated in app/photography/[mainCategory]/[subCategory]/page.tsx.
-- As in 00082, do NOT use the hrefs in types/studio.ts: that registry lists
-- /corporate/product, which 404s.
-- WhatsApp links use the PHOTOGRAPHY number (siteConfig.contact.whatsapp,
-- 917010092090), not the studio number used in 00069/00071.
--
-- Body HTML uses only tags the Tiptap editor produces: <p>, <strong>, <em>,
-- <a>, <ul>/<ol> + <li>.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

DO $$
DECLARE
  v_post_id    UUID;
  v_section_id UUID;
  v_cta_id     UUID;
BEGIN

  INSERT INTO public.blog_posts (
    slug, title, section, category,
    featured_image_alt,
    intro, author, tags, reading_time, published_at,
    meta_title, meta_description
  ) VALUES (
    'why-professional-product-photography-matters-for-your-brand',
    'Why Professional Product Photography Matters for Your Brand',
    'PHOTOGRAPHY',
    'COMMERCIAL_BRAND',
    'Professional product photography on a clean studio backdrop',
    '<p>Before a customer reads your product description, checks your pricing, or scrolls through your reviews, they see a photograph. In that first second, they''re already forming an opinion about your brand''s quality, credibility, and professionalism.</p>'
    '<p>That''s the quiet power of product photography — it''s not just documentation, it''s often the very first impression your brand makes.</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Wandering Kite Photography',
      'Product Photography Coimbatore',
      'Commercial Photography',
      'Brand Photography',
      'E-commerce Photography',
      'Studio Photography'
    ],
    5,
    -- 11 November 2026, per the brief's publish date.
    TIMESTAMPTZ '2026-11-11 09:00:00+05:30',
    'Why Professional Product Photography Matters | Wandering Kite Photography',
    'Discover why professional product photography is essential for building trust, boosting sales, and elevating your brand''s visual identity.'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title              = EXCLUDED.title,
    section            = EXCLUDED.section,
    category           = EXCLUDED.category,
    featured_image_alt = EXCLUDED.featured_image_alt,
    intro              = EXCLUDED.intro,
    author             = EXCLUDED.author,
    tags               = EXCLUDED.tags,
    reading_time       = EXCLUDED.reading_time,
    published_at       = EXCLUDED.published_at,
    meta_title         = EXCLUDED.meta_title,
    meta_description   = EXCLUDED.meta_description
  RETURNING id INTO v_post_id;

  DELETE FROM public.blog_sections WHERE post_id = v_post_id;
  DELETE FROM public.blog_qa       WHERE post_id = v_post_id;
  DELETE FROM public.blog_cta      WHERE post_id = v_post_id;

  -- ── S2 — what it does for a brand (carries in-post image 1) ─────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'What Professional Product Photography Actually Does for a Brand',
    '<p>The value isn''t only in how the photograph looks. It shows up in how customers judge the brand behind it.</p>',
    'RICH_TEXT',
    'Comparison of amateur versus professional product photography',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'It Builds Instant Trust',
   '<p>Clean, well-lit, professionally composed images signal that a brand takes itself seriously.</p>'
   '<p>Customers are far more likely to trust — and buy from — a brand whose visuals feel polished and consistent.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'It Directly Affects Purchase Decisions',
   '<p>On e-commerce platforms and social media alike, product photos often do more convincing than the description text beside them.</p>'
   '<p>Poor lighting, awkward angles, or inconsistent backgrounds can quietly cost a sale before a customer even reads further.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'It Creates Visual Consistency Across Platforms',
   '<p>A brand''s Instagram feed, website, and marketplace listings all benefit from a unified visual style.</p>'
   '<p>Professional photography makes that consistency possible — something that''s difficult to achieve with phone photos taken under different lighting each time.</p>',
   'RICH_TEXT', 2);

  -- ── S3 — where it makes the biggest impact ──────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Where Professional Product Photography Makes the Biggest Impact',
    '<p>Some surfaces reward good product imagery more than others. These three are where the difference shows up fastest.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'E-commerce Listings',
   '<p>Marketplaces are visually competitive spaces.</p>'
   '<p>A product with sharp, well-lit, accurately colored photographs stands out immediately against listings with dim or inconsistent images.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Social Media &amp; Advertising',
   '<p>Scroll-stopping product content depends heavily on visual quality.</p>'
   '<p>Professional photography gives brands a stronger foundation for ads, reels, and organic posts that actually hold attention.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Catalogs, Lookbooks &amp; Brand Decks',
   '<p>For brands pitching to retailers, investors, or partners, a professional product catalog communicates seriousness and scale — something inconsistent, self-shot images rarely achieve.</p>',
   'RICH_TEXT', 2);

  -- ── S4 — what goes into a shoot (carries in-post image 2) ───────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'What Goes Into a Professional Product Shoot',
    '<p>Much of what separates a professional product photograph from a quick phone shot happens before the shutter is pressed.</p>',
    'RICH_TEXT',
    'Behind-the-scenes studio setup for professional product photography',
    2
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Controlled, Consistent Lighting',
   '<p>Studio lighting setups eliminate the unpredictability of natural light, ensuring every product photograph — whether shot on day one or day twenty — looks consistent.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'The Right Backdrop for the Product',
   '<p>A clean, seamless backdrop (like a cyclorama wall) keeps the focus entirely on the product, free from distracting shadows or background clutter.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Attention to Color Accuracy',
   '<p>Customers expect what they see online to match what arrives at their door.</p>'
   '<p>Professional photography and careful editing help preserve true-to-life color and detail, reducing returns caused by mismatched expectations.</p>',
   'RICH_TEXT', 2);

  -- ── S5 — why this matters more than ever ────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Why This Matters More Than Ever',
    '<p>As more buying decisions happen online and through social media, the gap between brands with strong visual content and those without keeps growing.</p>'
    '<p>Professional product photography isn''t a luxury add-on anymore — it''s part of how a brand competes and communicates quality in a crowded market.</p>',
    'RICH_TEXT', 3
  );

  -- ── S6 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'Is professional product photography only necessary for large brands?',
   '<p>No. Brands of any size benefit from professional photography, especially smaller or newer brands trying to build trust and credibility quickly.</p>', 0),
  (v_post_id, 'What kind of products benefit most from studio photography?',
   '<p>Any product sold online or through social media benefits — from fashion and accessories to food, electronics, and packaged goods.</p>', 1),
  (v_post_id, 'Does Wandering Kite Photography offer studio space for product shoots?',
   '<p>Yes. The studio includes a cyclorama wall and professional lighting equipment suited for product, e-commerce, and commercial photography.</p>', 2),
  (v_post_id, 'How many products can be photographed in a single session?',
   '<p>This depends on the complexity of styling and the number of angles required per product. This can be discussed and planned during the consultation.</p>', 3);

  -- ── S7 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Ready to Elevate Your Brand''s Visuals?',
    '<p>Let''s talk about how professional product photography can help your brand stand out.</p>'
  ) RETURNING id INTO v_cta_id;

  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Book a Product Shoot', '/photography/corporate/product', 0),
  (v_cta_id, 'Talk to Wandering Kite',
   'https://wa.me/917010092090?text=Hi%21%20I''d%20like%20to%20discuss%20professional%20product%20photography%20for%20my%20brand.', 1);

END $$;

COMMIT;
