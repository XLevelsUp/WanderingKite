-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "Muthu Pandi & Sujitha: A Reception Evening in Fairy Lights".
--
-- Photography-section real-event story (section = 'PHOTOGRAPHY', category =
-- 'WEDDING_EVENT'). Companion to 00077's pre-wedding shoot for the same
-- couple — separate post, separate slug, so the two stand alone in the blog
-- index. Same idempotent-on-slug pattern as 00069/00071/00072/00074/00075/
-- 00076/00077: children deleted and reinserted on re-run.
--
-- Category note: the brief asked for "Engagement & Reception", but
-- "BlogCategory" (00066) only allows WEDDING_EVENT / PORTRAITS_LIFESTYLE /
-- COMMERCIAL_BRAND / TIPS_INSIGHTS. WEDDING_EVENT is the closest fit.
--
-- published_at is now() because the brief left "[Add publish date]" as a
-- placeholder. Set an explicit timestamp here to back-date or stage the post.
--
-- Both images are left NULL — upload them in the dashboard (Blog → edit).
-- Alt text is stored ready for when they are set: the featured image is the
-- close fairy-light portrait, and the S2 image is the wider bokeh frame.
--
-- CTA targets match 00076/00077: /photography/events is the live wedding and
-- event portfolio route (verified 200; /photography/engagement 404s), and
-- WhatsApp uses the PHOTOGRAPHY number (siteConfig.contact.whatsapp).
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
    'muthu-pandi-sujitha-reception-coimbatore',
    'Muthu Pandi & Sujitha: A Reception Evening in Fairy Lights',
    'PHOTOGRAPHY',
    'WEDDING_EVENT',
    'Muthu Pandi and Sujitha reception portrait lit by fairy lights, captured by Wandering Kite Photography',
    '<p>A reception evening has its own kind of magic — string lights, soft conversation, and two people who''ve just begun their life together, a little more relaxed than they were during the ceremony.</p>'
    '<p>Muthu Pandi &amp; Sujitha''s reception captured exactly that mood — elegant, warm, and quietly romantic, framed by a wall of glowing fairy lights.</p>'
    '<p>This is a glimpse into that evening, captured the way Wandering Kite approaches every celebration: with attention to real emotion first, and composition second.</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Wandering Kite Photography',
      'Reception Photography Coimbatore',
      'Engagement Photography',
      'Candid Couple Photography',
      'Coimbatore Photographers'
    ],
    4,
    now(),
    'Muthu Pandi & Sujitha | Reception Photography in Coimbatore',
    'A candid reception evening captured by Wandering Kite Photography — Muthu Pandi & Sujitha, lit by fairy lights and quiet, genuine moments.'
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

  -- ── S2 (carries the second in-post image: the wider bokeh frame) ────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'An Evening Lit by Fairy Lights',
    '<p>The light did most of the work here — ambient, warm, and soft enough to let the couple stay the focus.</p>',
    'RICH_TEXT',
    'Muthu Pandi and Sujitha reception evening portrait with bokeh lighting, Coimbatore',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'The Setting',
   '<p>A backdrop of soft, glowing string lights gave this reception portrait its warmth — the kind of ambient lighting that turns a simple corner into a beautiful frame without needing an elaborate set-up.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'The Look of the Evening',
   '<p>Sujitha''s silver-grey embellished saree paired with delicate jewelry brought an elegant, softer contrast to the day''s earlier bridal look, while Muthu Pandi''s navy suit and red bow tie added a sharp, celebratory finish.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'The Real Moment',
   '<p>The featured image captures the couple in a quiet, genuine exchange — not a formal pose, but a real smile shared between two people enjoying their own celebration.</p>',
   'RICH_TEXT', 2);

  -- ── S3 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Why This Evening Stood Out',
    '<p>Two choices shaped how this part of the celebration was photographed.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Soft Lighting, Real Emotion',
   '<p>Reception photography often leans toward formal, posed shots — but the real charm here came from working with the ambient fairy lights to capture a softer, more intimate mood.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'A Change of Palette',
   '<p>Moving from bridal reds and golds to a cooler silver-grey palette for the reception gave this part of the story its own distinct visual identity, rather than repeating the same look throughout the day.</p>',
   'RICH_TEXT', 1);

  -- ── S4 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Capturing Receptions, the Wandering Kite Way',
    '<p>Every part of a wedding celebration — the ceremony, the reception, the quiet moments in between — deserves its own visual treatment.</p>'
    '<p>Muthu Pandi &amp; Sujitha''s reception is a good example of how changing light, setting, and mood can add a completely different layer to a couple''s overall wedding story.</p>',
    'RICH_TEXT', 2
  );

  -- ── S5 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'Does Wandering Kite Photography cover wedding receptions separately from the ceremony?',
   '<p>Yes. The team photographs full wedding celebrations, including ceremonies, receptions, and pre-wedding shoots, tailored to each event''s mood and setting.</p>', 0),
  (v_post_id, 'Can lighting styles like this fairy-light setup be requested for a reception?',
   '<p>Yes. Clients can discuss specific lighting, mood, or styling preferences during the consultation to plan the best approach for their reception.</p>', 1),
  (v_post_id, 'How long does it take to receive the final reception photographs?',
   '<p>Professionally edited, high-resolution images are typically delivered within 7–10 days via a cloud link.</p>', 2);

  -- ── S6 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Ready to Tell Your Story?',
    '<p>From the ceremony to the reception evening, every part of your celebration deserves to be captured beautifully. Let''s talk about yours.</p>'
  ) RETURNING id INTO v_cta_id;

  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'View Our Wedding Portfolio', '/photography/events', 0),
  (v_cta_id, 'Talk to Wandering Kite',
   'https://wa.me/917010092090?text=Hi%21%20I''m%20interested%20in%20booking%20a%20photography%20session.', 1);

END $$;

COMMIT;
