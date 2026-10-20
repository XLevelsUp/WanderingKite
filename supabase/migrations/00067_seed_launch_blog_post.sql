-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "The Wandering Kite Story" launch blog post.
--
-- Run AFTER 00065 and 00066.
--
-- Idempotent: re-running replaces the post's content rather than creating a
-- duplicate. Children are deleted and reinserted, matching what the admin
-- form does on save.
--
-- The featured image and the S3 section image are left NULL — upload them in
-- the dashboard (Blog → edit → Featured image). Alt text is stored ready for
-- when they are set. Note that image *captions* are not part of the schema:
-- the source content supplied captions, but the agreed model has one featured
-- image with alt text only.
--
-- Body HTML uses only the tags the Tiptap editor can produce: <p>, <strong>,
-- <em>, <a>, <ul>/<ol> + <li>. Anything richer would not round-trip through
-- the editor when someone opens the post to edit it.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

DO $$
DECLARE
  v_post_id    UUID;
  v_section_id UUID;
  v_cta_id     UUID;
BEGIN

  -- ── Post ────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_posts (
    slug, title, section, category,
    featured_image_alt,
    intro, author, tags, reading_time, published_at,
    meta_title, meta_description
  ) VALUES (
    'the-wandering-kite-story-photography-coimbatore',
    'The Wandering Kite Story: Where Photography Meets Storytelling',
    'PHOTOGRAPHY',
    'TIPS_INSIGHTS',
    'Wandering Kite Photography capturing authentic visual stories in Coimbatore',
    '<p>A photograph can capture much more than a moment. It can preserve an emotion, communicate an idea, or bring a memory back to life.</p>'
    '<p>This belief is at the heart of Wandering Kite Photography.</p>'
    '<p>Based in Coimbatore, Wandering Kite works across wedding, event, portrait, corporate, product, and commercial photography. From intimate personal moments to carefully planned brand campaigns, every project begins by understanding the story behind the image.</p>'
    '<p>Our approach combines authentic storytelling with thoughtful composition, professional lighting, and careful post-production. The goal is not simply to create photographs that look beautiful, but visuals that feel meaningful and serve a purpose.</p>'
    '<p>Whether it is a wedding, a portrait session, or a commercial campaign, we believe the best photographs are the ones that continue to tell their story long after the shoot is over.</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Wandering Kite Photography',
      'Photography Coimbatore',
      'Visual Storytelling',
      'Wedding Photography',
      'Commercial Photography',
      'Portrait Photography',
      'Coimbatore Photographers'
    ],
    6,
    '2026-09-01T09:00:00+05:30',
    'The Wandering Kite Story | Photography in Coimbatore',
    'Discover the story behind Wandering Kite Photography and our approach to wedding, portrait, commercial, corporate and event photography in Coimbatore.'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title              = EXCLUDED.title,
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

  -- Clear existing children so re-running is a clean replace.
  DELETE FROM public.blog_sections WHERE post_id = v_post_id;
  DELETE FROM public.blog_qa       WHERE post_id = v_post_id;
  DELETE FROM public.blog_cta      WHERE post_id = v_post_id;

  -- ── S2 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'What Inspires the Wandering Kite Approach?',
    '<p>Photography is often described as the art of capturing a moment. But for us, there is more to it.</p>'
    '<p>The process begins with understanding people, places, emotions, and ideas.</p>',
    'RICH_TEXT', 0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Authentic Moments Matter',
   '<p>Not every meaningful photograph needs to be perfectly posed.</p>'
   '<p>During weddings and events, some of the strongest images can come from genuine reactions, interactions, and emotions. Wandering Kite''s approach focuses on capturing these moments naturally while also creating thoughtfully composed portraits when required.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Every Project Has a Different Story',
   '<p>A wedding and a commercial campaign cannot be photographed in exactly the same way.</p>'
   '<p>A wedding may focus on emotion and relationships, while product or corporate photography may need to communicate a brand''s identity clearly.</p>'
   '<p>That is why the approach changes according to the purpose of the project.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Photography Meets Creative Direction',
   '<p>For commercial work, photography is not only about the camera.</p>'
   '<p>Lighting, styling, composition, location, mood, and visual consistency all contribute to the final image.</p>'
   '<p>Wandering Kite works across product photography, corporate photography, social media content, advertisements, music videos, and other commercial productions.</p>',
   'RICH_TEXT', 2);

  -- ── S3 (carries the in-post image) ──────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'What Makes a Wandering Kite Photograph Different?',
    '<p>A professional photograph is the result of many decisions coming together.</p>',
    'RICH_TEXT',
    'Wandering Kite Photography capturing authentic visual stories in Coimbatore',
    1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Understanding the Requirement',
   '<p>Before the camera comes out, understanding the purpose of the shoot is important.</p>'
   '<p>Is the photograph meant to preserve a personal memory? Represent a person professionally? Showcase a product? Or communicate a brand idea?</p>'
   '<p>The answer influences everything that follows.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Creating the Right Visual Experience',
   '<p>Lighting, framing, composition, background, expressions, and perspective can completely change how an image feels.</p>'
   '<p>The team works with professional cameras, lenses, lighting, and grip equipment to create visuals suited to different photography requirements.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Preserving the Natural Feel',
   '<p>Post-production is an important part of professional photography, but it should support the original photograph rather than overpower it.</p>'
   '<p>Wandering Kite''s stated approach includes natural colour correction, subtle retouching, and preserving the authentic mood of the moment.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'From Personal Stories to Brand Stories',
   '<p>The same philosophy extends across different types of photography.</p>'
   '<p>A couple may want to remember how their wedding actually felt.</p>'
   '<p>A family may want to preserve an important chapter of their lives.</p>'
   '<p>A brand may want photographs that communicate its identity.</p>'
   '<p>Different stories require different visual approaches—but each deserves to be captured thoughtfully.</p>',
   'RICH_TEXT', 3);

  -- ── S4 — numbered process ───────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Our Photography Journey With You',
    '<p>A good photography experience should feel clear from the first conversation to the final delivery.</p>'
    '<ol>'
    '<li><strong>Initial Consultation</strong> — Discuss your requirements, vision, preferred dates, and photography needs.</li>'
    '<li><strong>Planning &amp; Booking</strong> — Once the requirements are understood, the project is planned according to the selected package and shoot requirements.</li>'
    '<li><strong>The Shoot</strong> — The photography team works to capture the important moments while creating the required compositions and visuals.</li>'
    '<li><strong>Post Production</strong> — The selected photographs are professionally edited with attention to colour, detail, and the overall mood.</li>'
    '<li><strong>Delivery</strong> — The final high-resolution photographs are delivered through a cloud link, typically within 7–10 days.</li>'
    '</ol>',
    'ORDERED_LIST', 2
  );

  -- ── S5 — bulleted list ──────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Why Choose Wandering Kite Photography?',
    '<p>Choosing a photographer is about more than selecting someone with a camera.</p>'
    '<p>It is about finding a team that understands what you want your photographs to communicate.</p>'
    '<p>Wandering Kite combines:</p>'
    '<ul>'
    '<li>Authentic visual storytelling</li>'
    '<li>Wedding and event photography</li>'
    '<li>Portrait and lifestyle photography</li>'
    '<li>Product and commercial photography</li>'
    '<li>Corporate and headshot photography</li>'
    '<li>Social media and brand content</li>'
    '<li>Professional photography equipment</li>'
    '<li>A structured consultation-to-delivery process</li>'
    '</ul>'
    '<p>From Coimbatore to projects across different locations, the focus remains the same: creating photographs that have meaning, purpose, and visual impact.</p>',
    'BULLET_LIST', 3
  );

  -- ── S6 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'What type of photography does Wandering Kite offer?',
   '<p>Wandering Kite offers wedding, event, portrait, maternity, newborn, product, corporate, headshot, social media content, and commercial photography services.</p>', 0),
  (v_post_id, 'Where is Wandering Kite Photography based?',
   '<p>Wandering Kite is based in RS Puram, Coimbatore, Tamil Nadu, and serves clients across Coimbatore, Tiruppur, Salem, and Erode.</p>', 1),
  (v_post_id, 'Does Wandering Kite cover destination weddings?',
   '<p>Yes. The team covers destination weddings and events across India.</p>', 2),
  (v_post_id, 'Can I request a specific photography style?',
   '<p>Yes. Clients can share reference photographs, Pinterest boards, or specific must-have shots during the consultation to help create a suitable shot list.</p>', 3),
  (v_post_id, 'How long does delivery take?',
   '<p>Professionally edited high-resolution images are generally delivered within 7–10 days.</p>', 4);

  -- ── S7 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Ready to Tell Your Story?',
    '<p>Explore the work of Wandering Kite Photography and discover a visual approach created around your story, your people, and your purpose.</p>'
  ) RETURNING id INTO v_cta_id;

  -- Targets verified against the live routes: there is no /contact page (the
  -- site contacts via WhatsApp, per lib/whatsapp.ts) and no #portfolio anchor,
  -- so the portfolio button points at the events category listing.
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Explore Photography',    '/photography',        0),
  (v_cta_id, 'View Our Portfolio',     '/photography/events', 1),
  (v_cta_id, 'Talk to Wandering Kite',
   'https://wa.me/917010092090?text=Hi%21%20I%27m%20interested%20in%20booking%20a%20photography%20session.', 2);

END $$;

COMMIT;
