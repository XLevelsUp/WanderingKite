-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "Terry Weds Silviya: A Christian Wedding Story from Coimbatore".
--
-- Photography-section real-wedding story (section = 'PHOTOGRAPHY', category =
-- 'WEDDING_EVENT'). Same idempotent-on-slug pattern as 00069/00071/00072/
-- 00074/00075: children deleted and reinserted on re-run.
--
-- Category note: the brief asked for "Real Weddings", but "BlogCategory"
-- (00066) only allows WEDDING_EVENT / PORTRAITS_LIFESTYLE / COMMERCIAL_BRAND /
-- TIPS_INSIGHTS. WEDDING_EVENT is the closest fit. A real REAL_WEDDINGS value
-- would need an ALTER TYPE migration plus a matching option in the admin
-- category picker — deliberately not done here.
--
-- published_at is now() because the brief left "[Add publish date]" as a
-- placeholder. Set an explicit timestamp here if the post should be
-- back-dated or staged for later.
--
-- Both images are left NULL — upload them in the dashboard (Blog → edit).
-- Alt text is stored ready for when they are set: the featured image is the
-- floral/lantern portrait, and the S2 image is the closer candid frame.
--
-- CTA targets match 00072/00074: /photography/events is the live wedding and
-- event portfolio route (PortfolioCategories.tsx — there is no dedicated
-- /photography/wedding slug), and WhatsApp uses the PHOTOGRAPHY number
-- (siteConfig.contact.whatsapp), not the studio number.
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
    'terry-weds-silviya-christian-wedding-coimbatore',
    'Terry Weds Silviya: A Christian Wedding Story from Coimbatore',
    'PHOTOGRAPHY',
    'WEDDING_EVENT',
    'Terry and Silviya candid wedding portrait captured by Wandering Kite Photography in Coimbatore',
    '<p>Every wedding has a moment that outlives the rest of the day in memory — not the ceremony itself, but a look, a laugh, a second that wasn''t planned.</p>'
    '<p>For Terry &amp; Silviya, that moment came against a wall of roses and glowing lanterns, somewhere between a pose and a genuine laugh neither of them saw coming.</p>'
    '<p>Terry &amp; Silviya''s Christian wedding in Coimbatore was full of exactly these kinds of moments — from the vows exchanged at the church to the warmth of the reception that followed.</p>'
    '<p>This is their story, as we saw it through the lens — captured the way Wandering Kite approaches every wedding: with attention to real emotion first, and composition second.</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Wandering Kite Photography',
      'Real Wedding Coimbatore',
      'Christian Wedding Photography',
      'Candid Wedding Photography',
      'Church Wedding Coimbatore',
      'Coimbatore Photographers'
    ],
    5,
    now(),
    'Terry Weds Silviya | Christian Wedding Photography in Coimbatore',
    'A real Christian wedding story captured by Wandering Kite Photography — Terry & Silviya''s celebration in Coimbatore, told through candid moments and genuine emotion.'
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

  -- ── S2 (carries the second in-post image: the closer candid frame) ──────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'A Celebration Built on Warmth',
    '<p>The evening came together around the couple rather than around a theme — light, colour and setting all working to frame two people rather than compete with them.</p>',
    'RICH_TEXT',
    'Candid moment between Terry and Silviya at their wedding celebration, Coimbatore',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'The Setting',
   '<p>Soft string lanterns, a wall of deep red roses, and warm evening light set the tone for the evening — a backdrop that felt celebratory without overpowering the two people it was there to frame.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'The Colors of the Day',
   '<p>Silviya''s red silk saree, layered with gold temple jewelry, carried the richness of tradition, while Terry''s black suit and red tie brought a modern, sharp contrast — together, a pairing that photographed beautifully against the greenery and gold-lit lanterns behind them.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'The Real Moment',
   '<p>The featured image says it best: a portrait that started as a pose and turned into something else entirely — Silviya glancing away mid-laugh, Terry caught in a genuine grin.</p>'
   '<p>It''s the kind of frame that can''t be directed, only waited for.</p>',
   'RICH_TEXT', 2);

  -- ── S3 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Why This Wedding Stood Out',
    '<p>Three things made Terry &amp; Silviya''s celebration photograph the way it did.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Genuine Reactions Over Rehearsed Poses',
   '<p>Terry &amp; Silviya''s wedding is a good example of what Wandering Kite looks for in every celebration — the unscripted seconds that reveal how two people actually feel about each other, not just how they look standing together.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'A Backdrop That Complemented, Not Competed',
   '<p>The floral and lantern setting added warmth and texture without distracting from the couple themselves — a reminder that good wedding photography balances environment and subject rather than favoring one over the other.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Color and Contrast Done Right',
   '<p>The interplay between Silviya''s red-and-gold traditional look and Terry''s black-and-red modern suiting gave the images a visual richness that comes through even in a single still frame.</p>',
   'RICH_TEXT', 2);

  -- ── S4 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Highlights From the Day',
    '<p>The moments that shaped the story, from the church to the last of the celebration:</p>'
    '<ul>'
    '<li><strong>The Ceremony</strong> — the exchange of vows at the church, marking the beginning of Terry &amp; Silviya''s journey together.</li>'
    '<li><strong>The Reception Welcome</strong> — guests arriving into a warmly lit, floral-decorated reception space set the tone for the evening ahead.</li>'
    '<li><strong>The Portraits</strong> — candid and posed portraits of Terry &amp; Silviya together, framed against the rose and lantern backdrop.</li>'
    '<li><strong>The In-Between Moments</strong> — genuine laughter, quiet glances, and small interactions that happened just outside the "planned" shots.</li>'
    '<li><strong>The Celebration</strong> — the joy of family and friends gathered to celebrate the couple''s new chapter together.</li>'
    '</ul>',
    'BULLET_LIST', 2
  );

  -- ── S5 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Capturing Real Weddings, the Wandering Kite Way',
    '<p>Every couple''s wedding day has its own rhythm, and Terry &amp; Silviya''s was no different — full of color, warmth, and moments that couldn''t have been scripted even if we tried.</p>'
    '<p>This is the same approach Wandering Kite brings to every wedding: understanding the couple first, then letting the day unfold naturally in front of the camera.</p>',
    'RICH_TEXT', 3
  );

  -- ── S6 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'Does Wandering Kite Photography cover Christian weddings?',
   '<p>Yes. The team photographs weddings across all traditions and communities, including Christian church ceremonies and receptions, alongside Hindu, Muslim, and interfaith celebrations.</p>', 0),
  (v_post_id, 'Does Wandering Kite Photography shoot weddings outside Coimbatore?',
   '<p>Yes. The team covers weddings and events across Coimbatore, Tiruppur, Salem, Erode, and destination weddings across India.</p>', 1),
  (v_post_id, 'Can couples request a specific photography style, like this one?',
   '<p>Yes. Clients can share reference photographs or Pinterest boards during the consultation to help build a shot list suited to their vision.</p>', 2),
  (v_post_id, 'How long does it take to receive the final wedding photographs?',
   '<p>Professionally edited, high-resolution images are typically delivered within 7–10 days via a cloud link.</p>', 3);

  -- ── S7 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Ready to Tell Your Story?',
    '<p>Every couple''s wedding day deserves to be captured with the same care and authenticity as Terry &amp; Silviya''s. Let''s talk about yours.</p>'
  ) RETURNING id INTO v_cta_id;

  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'View Our Wedding Portfolio', '/photography/events', 0),
  (v_cta_id, 'Talk to Wandering Kite',
   'https://wa.me/917010092090?text=Hi%21%20I''m%20interested%20in%20booking%20a%20photography%20session.', 1);

END $$;

COMMIT;
