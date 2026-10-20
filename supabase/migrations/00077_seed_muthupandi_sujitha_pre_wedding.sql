-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "Muthu Pandi & Sujitha: A Candid Hindu Pre-Wedding Shoot in the
-- Countryside".
--
-- Photography-section real-shoot story (section = 'PHOTOGRAPHY', category =
-- 'WEDDING_EVENT'). Same idempotent-on-slug pattern as 00069/00071/00072/
-- 00074/00075/00076: children deleted and reinserted on re-run.
--
-- Category note: the brief asked for "Pre-Wedding Shoots", but "BlogCategory"
-- (00066) only allows WEDDING_EVENT / PORTRAITS_LIFESTYLE / COMMERCIAL_BRAND /
-- TIPS_INSIGHTS. WEDDING_EVENT is the closest fit, matching 00076's real-
-- wedding story. A real PRE_WEDDING value would need an ALTER TYPE migration
-- plus a matching option in the admin category picker — not done here.
--
-- published_at is now() because the brief left "[Add publish date]" as a
-- placeholder. Set an explicit timestamp here to back-date or stage the post.
--
-- Both images are left NULL — upload them in the dashboard (Blog → edit).
-- Alt text is stored ready for when they are set: the featured image is the
-- motorbike forehead-kiss portrait, and the S2 image is the wider countryside
-- frame.
--
-- CTA route note: the "pre-wedding portfolio" button points at
-- /photography/events, which is verified live (200) and whose own copy reads
-- "Weddings, Engagements & Birthdays" (PortfolioCategories.tsx). There is no
-- pre-wedding or engagement portfolio route — SERVICE_REGISTRY in
-- types/studio.ts still lists /photography/engagement, but that URL 404s.
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
    'muthu-pandi-sujitha-pre-wedding-shoot-coimbatore',
    'Muthu Pandi & Sujitha: A Candid Hindu Pre-Wedding Shoot in the Countryside',
    'PHOTOGRAPHY',
    'WEDDING_EVENT',
    'Muthu Pandi and Sujitha candid couple portrait on a motorbike, captured by Wandering Kite Photography',
    '<p>Not every pre-wedding photograph needs a grand backdrop. Sometimes, an open field, a quiet road, and two people on a motorbike say more than an elaborate set-up ever could.</p>'
    '<p>That''s exactly the story Muthu Pandi &amp; Sujitha''s pre-wedding shoot tells — captured ahead of their Hindu wedding, set against the kind of wide-open countryside that turns a simple moment into something cinematic.</p>'
    '<p>This is their story, as we saw it through the lens — captured the way Wandering Kite approaches every pre-wedding shoot: with attention to real emotion first, and composition second.</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Wandering Kite Photography',
      'Pre-Wedding Shoot Coimbatore',
      'Hindu Wedding Photography',
      'Candid Pre-Wedding Photography',
      'South Indian Pre-Wedding',
      'Coimbatore Photographers'
    ],
    5,
    now(),
    'Muthu Pandi & Sujitha | Hindu Pre-Wedding Shoot in Coimbatore',
    'A candid pre-wedding shoot captured by Wandering Kite Photography — Muthu Pandi & Sujitha''s countryside pre-wedding story ahead of their Hindu wedding.'
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

  -- ── S2 (carries the second in-post image: the wider countryside frame) ──
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'A Story Told in Open Landscapes',
    '<p>The location carried this shoot — wide fields and soft light doing the work an elaborate set-up usually has to.</p>',
    'RICH_TEXT',
    'Muthu Pandi and Sujitha wedding countryside photography by Wandering Kite Photography',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'The Setting',
   '<p>Rolling green fields, distant hills, and an overcast sky gave this shoot a soft, cinematic quality — a refreshing contrast to the more traditional indoor or mandap-style wedding portraits.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'The Colors of the Day',
   '<p>Sujitha''s golden-yellow silk saree and layered gold jewelry stood out beautifully against the green countryside, while Muthu Pandi''s soft mint shirt kept the overall palette warm and natural rather than overly staged.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'The Real Moment',
   '<p>The featured image captures it best — a forehead kiss shared mid-ride, sunglasses on, hair caught in the wind.</p>'
   '<p>It''s unplanned, unposed, and exactly the kind of moment Wandering Kite looks for in every shoot.</p>',
   'RICH_TEXT', 2);

  -- ── S3 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Why This Shoot Stood Out',
    '<p>Three things gave this set its character.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Using Location as a Storytelling Tool',
   '<p>Rather than relying on elaborate décor, this shoot leaned into the natural landscape — proving that a strong location and good light can carry a photograph just as powerfully as a styled set.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'A Genuine, Unscripted Moment',
   '<p>The forehead kiss on the motorbike wasn''t directed — it happened naturally as the couple settled into the ride, which is exactly why it became the standout image of the set.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Tradition Meets a Modern Setting',
   '<p>Sujitha''s traditional silk saree and gold jewelry against a rustic, open-road backdrop created a striking contrast between classic Hindu bridal styling and a refreshingly modern setting.</p>',
   'RICH_TEXT', 2);

  -- ── S4 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Highlights From the Shoot',
    '<p>The moments that shaped the set:</p>'
    '<ul>'
    '<li><strong>The Journey</strong> — the couple riding together through open countryside, setting a relaxed, natural tone for the shoot.</li>'
    '<li><strong>The Candid Moment</strong> — a spontaneous forehead kiss captured mid-ride, unposed and completely genuine.</li>'
    '<li><strong>The Landscape</strong> — wide green fields and distant hills used as a natural, uncluttered backdrop.</li>'
    '<li><strong>The Details</strong> — Sujitha''s gold jewelry and silk saree, captured in close, intimate frames against the open sky.</li>'
    '</ul>',
    'BULLET_LIST', 2
  );

  -- ── S5 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Capturing Pre-Wedding Stories, the Wandering Kite Way',
    '<p>Muthu Pandi &amp; Sujitha''s shoot is a good example of how a change in setting — trading a traditional backdrop for open countryside — can bring out completely different, equally powerful storytelling ahead of a Hindu wedding celebration.</p>'
    '<p>This flexibility, paired with an eye for genuine, unscripted moments, is what Wandering Kite brings to every couple''s pre-wedding story.</p>',
    'RICH_TEXT', 3
  );

  -- ── S6 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'Does Wandering Kite Photography shoot Hindu pre-wedding and wedding photography?',
   '<p>Yes. The team photographs Hindu weddings and pre-wedding shoots, along with Christian, and other community and interfaith celebrations.</p>', 0),
  (v_post_id, 'Does Wandering Kite Photography shoot outdoor or countryside-style pre-wedding shoots?',
   '<p>Yes. The team works across a range of settings, from traditional indoor shoots to open outdoor and countryside locations, based on what best suits the couple''s vision.</p>', 1),
  (v_post_id, 'Does Wandering Kite Photography shoot weddings outside Coimbatore?',
   '<p>Yes. The team covers weddings, pre-wedding shoots, and events across Coimbatore, Tiruppur, Salem, Erode, and destination weddings across India.</p>', 2),
  (v_post_id, 'Can couples request a specific photography style or location, like this one?',
   '<p>Yes. Clients can share reference photographs, Pinterest boards, or specific location ideas during the consultation to help build a shot list suited to their vision.</p>', 3),
  (v_post_id, 'How long does it take to receive the final photographs?',
   '<p>Professionally edited, high-resolution images are typically delivered within 7–10 days via a cloud link.</p>', 4);

  -- ── S7 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Ready to Tell Your Story?',
    '<p>Whether it''s a traditional Hindu wedding or an open-road countryside pre-wedding shoot like Muthu Pandi &amp; Sujitha''s, every couple''s story deserves to be captured authentically. Let''s talk about yours.</p>'
  ) RETURNING id INTO v_cta_id;

  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'View Our Pre-Wedding Portfolio', '/photography/events', 0),
  (v_cta_id, 'Talk to Wandering Kite',
   'https://wa.me/917010092090?text=Hi%21%20I''m%20interested%20in%20booking%20a%20photography%20session.', 1);

END $$;

COMMIT;
