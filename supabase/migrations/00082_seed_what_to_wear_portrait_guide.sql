-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "What to Wear for a Portrait Photoshoot: A Simple Guide to Looking
--         Natural on Camera"
--
-- Photography-section blog post (section = 'PHOTOGRAPHY', category =
-- 'PORTRAITS_LIFESTYLE'). PORTRAITS_LIFESTYLE already exists from 00066, so
-- unlike the studio posts this needs no ALTER TYPE first.
--
-- Same idempotent-on-slug pattern as 00074–00081: children are deleted and
-- reinserted on re-run, matching the admin form's save behaviour.
--
-- Images: the featured image and the two in-post images (S2, S4) are left
-- NULL — upload them in the dashboard (Blog → edit). Alt text is stored now
-- so it is in place the moment an image is set. The brief suggests an outfit
-- flat-lay for the hero, a busy-vs-solid comparison for S2 and a laid-out
-- outfit for S4; the captions in the brief are editorial notes and have no
-- column on blog_sections, so they are not stored.
--
-- CTA targets: /photography/portraits is the live portrait landing route.
-- NOTE the registry in types/studio.ts lists /photography/family and
-- /photography/maternity, but app/photography/[mainCategory]/page.tsx only
-- accepts events | portraits | corporate | commercial and calls notFound()
-- otherwise — so those registry hrefs 404. Do not copy them into CTAs.
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
    'what-to-wear-for-a-portrait-photoshoot-guide',
    'What to Wear for a Portrait Photoshoot: A Simple Guide to Looking Natural on Camera',
    'PHOTOGRAPHY',
    'PORTRAITS_LIFESTYLE',
    'Outfit inspiration for a natural, camera-friendly portrait photoshoot',
    '<p>One of the most common questions we hear before a portrait session isn''t about poses or locations — it''s <em>"What should I wear?"</em></p>'
    '<p>It''s a fair question. The right outfit can make you feel confident and comfortable in front of the camera, while the wrong choice can end up distracting from the very thing the photograph is meant to capture: you.</p>'
    '<p>Here''s a simple, practical guide to help you choose an outfit that photographs beautifully and still feels like your own personal style.</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Wandering Kite Photography',
      'Portrait Photography Tips',
      'What to Wear for Photoshoot',
      'Portrait Photoshoot Coimbatore',
      'Photography Tips'
    ],
    5,
    -- 1 November 2026, per the brief's publish date.
    TIMESTAMPTZ '2026-11-01 09:00:00+05:30',
    'What to Wear for a Portrait Photoshoot | Wandering Kite Photography',
    'A simple guide to choosing the right outfit for your portrait photoshoot — colors, fit, and styling tips to help you look natural and confident on camera.'
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

  -- ── S2 — the basics (carries in-post image 1) ───────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'The Basics of Dressing for a Photoshoot',
    '<p>Before thinking about specific colors or styles, a few fundamentals apply to almost every portrait session.</p>'
    '<p>Get these right and most other choices become easier.</p>',
    'RICH_TEXT',
    'Comparison of busy patterned outfit versus simple solid-colored outfit for portraits',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Choose Solid Colors Over Busy Patterns',
   '<p>Bold prints, small checks, and busy patterns can visually compete with your face and expressions in a photograph.</p>'
   '<p>Solid colors or subtle textures let the focus stay on you, not your outfit.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Think About Your Location and Backdrop',
   '<p>An outfit that looks great on its own might clash with the setting.</p>'
   '<p>If you''re shooting outdoors in greenery, earthy tones and muted colors tend to blend beautifully. For a plain studio backdrop, you have more freedom to experiment with color.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Comfort Matters More Than You''d Think',
   '<p>If an outfit feels tight, itchy, or unfamiliar, it shows in your body language — stiff shoulders, forced smiles, subtle discomfort.</p>'
   '<p>Choose something you''ve worn before and feel genuinely comfortable in.</p>',
   'RICH_TEXT', 2);

  -- ── S3 — couples, families, groups ──────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Tips for Couples, Families &amp; Group Portraits',
    '<p>Dressing one person is straightforward. Dressing a group so everyone looks like they belong in the same frame takes a little more planning.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Coordinate, Don''t Match Exactly',
   '<p>Wearing the exact same outfit as everyone else in the frame can look overly staged.</p>'
   '<p>Instead, coordinate within a shared color palette — for example, varying shades of blue and cream — so the group looks cohesive without looking identical.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Balance Busy and Simple Across the Group',
   '<p>If one person''s outfit has a pattern or statement piece, balance it by keeping others in solid, simple tones.</p>'
   '<p>This keeps the overall frame visually balanced rather than overwhelming.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Layer for Variety',
   '<p>Adding a jacket, scarf, or layered piece gives you options to change your look slightly between shots without needing a full outfit change — useful for portrait sessions with multiple setups.</p>',
   'RICH_TEXT', 2);

  -- ── S4 — small details (carries in-post image 2) ────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'Small Details That Make a Big Difference',
    '<p>The outfit is only part of it. A few small choices on the day itself often decide whether a photograph feels polished or slightly off.</p>',
    'RICH_TEXT',
    'Prepared outfit and accessories laid out ahead of a portrait photoshoot',
    2
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Keep Accessories Minimal',
   '<p>Statement jewelry or accessories can catch the light unpredictably or distract from your expression.</p>'
   '<p>A few simple, well-chosen pieces usually photograph better than a lot of layered accessories.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Avoid Logos and Text',
   '<p>Large logos, brand names, or text on clothing can date a photograph quickly and pull focus away from you.</p>'
   '<p>Simple, logo-free pieces tend to age better in photographs over the years.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Iron and Prepare in Advance',
   '<p>Wrinkled fabric is far more visible in photographs than in person, especially in close-up shots.</p>'
   '<p>Steaming or ironing your outfit the night before saves time and stress on the actual day.</p>',
   'RICH_TEXT', 2);

  -- ── S5 — color pairings (bulleted) ──────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'A Few Color Pairings That Work Well on Camera',
    '<p>If you''d rather start from a palette than from a single piece, these combinations are reliably flattering:</p>'
    '<ul>'
    '<li><strong>Soft neutrals</strong> (beige, cream, dusty pink) — timeless and flattering across most skin tones and backdrops</li>'
    '<li><strong>Earthy tones</strong> (olive, rust, terracotta) — ideal for outdoor and natural settings</li>'
    '<li><strong>Muted jewel tones</strong> (deep teal, wine, navy) — add richness without overpowering the frame</li>'
    '<li><strong>Classic monochrome</strong> (black and white) — clean, elegant, and always photographs well</li>'
    '</ul>',
    'BULLET_LIST', 3
  );

  -- ── S6 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'Should I match my outfit to the photographer''s studio or location?',
   '<p>It helps to know the setting in advance. Earthy, muted tones work well outdoors, while a plain studio backdrop allows for more color flexibility.</p>', 0),
  (v_post_id, 'What should I avoid wearing for a portrait session?',
   '<p>Busy patterns, large logos, overly tight or uncomfortable fits, and heavy, distracting accessories are best avoided.</p>', 1),
  (v_post_id, 'Can Wandering Kite Photography help guide outfit choices before a shoot?',
   '<p>Yes. Clients can discuss outfit ideas, color palettes, and styling questions during the consultation ahead of their session.</p>', 2),
  (v_post_id, 'Do coordinated outfits work better than exactly matching outfits for group portraits?',
   '<p>Yes. Coordinating within a shared color palette tends to look more natural and less staged than everyone wearing identical outfits.</p>', 3);

  -- ── S7 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Ready for Your Portrait Session?',
    '<p>Not sure what to wear? Let''s talk it through together and plan a look that feels like you.</p>'
  ) RETURNING id INTO v_cta_id;

  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Book a Portrait Session', '/photography/portraits', 0),
  (v_cta_id, 'Talk to Wandering Kite',
   'https://wa.me/917010092090?text=Hi%21%20I''d%20like%20to%20plan%20a%20portrait%20session%20and%20talk%20through%20what%20to%20wear.', 1);

END $$;

COMMIT;
