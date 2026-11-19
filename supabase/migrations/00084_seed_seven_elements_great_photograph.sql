-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "What Makes a Great Photograph? 7 Elements Every Photographer
--         Should Understand"
--
-- Photography-section blog post (section = 'PHOTOGRAPHY', category =
-- 'TIPS_INSIGHTS'). TIPS_INSIGHTS already exists from 00066, so like
-- 00082/00083 this needs no ALTER TYPE first.
--
-- Same idempotent-on-slug pattern as 00074–00083: children are deleted and
-- reinserted on re-run, matching the admin form's save behaviour.
--
-- STRUCTURE NOTE: the brief puts all seven elements under one section (S2)
-- as S2.S1–S2.S7, and they are stored that way — one blog_sections row with
-- seven blog_subsections. The brief also places image 1 after element 3 and
-- image 2 after element 7, but blog_sections carries at most one image and
-- subsections carry none (00066), so only the second (process) image is kept
-- on the elements section. The first comparison image has nowhere to live
-- without splitting the seven elements across two sections, which would
-- change the brief's numbering. Raise it if you want that split.
--
-- Images: the featured image and the S2 image are left NULL — upload them in
-- the dashboard (Blog → edit). Alt text is stored now so it is in place the
-- moment an image is set.
--
-- CTA targets: /photography is the portfolio hub (used the same way by the
-- 00067 launch post). There is no /portfolio or /gallery route in
-- apps/marketing — do not invent one. As in 00082/00083, do NOT take hrefs
-- from the registry in types/studio.ts; several of them 404.
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
    'what-makes-a-great-photograph-7-elements',
    'What Makes a Great Photograph? 7 Elements Every Photographer Should Understand',
    'PHOTOGRAPHY',
    'TIPS_INSIGHTS',
    'Example of a well-composed photograph demonstrating strong light and emotion',
    '<p>Ask ten photographers what makes a photograph <em>"great,"</em> and you''ll likely get ten different answers. But behind the different opinions, a few core elements tend to show up again and again in the images that actually stop people mid-scroll.</p>'
    '<p>Whether you''re a beginner trying to understand the basics, or simply curious about what''s happening behind a photograph you love, here are seven elements worth understanding.</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Wandering Kite Photography',
      'Photography Tips',
      'Composition',
      'Photography Basics',
      'Visual Storytelling',
      'Coimbatore Photographers'
    ],
    6,
    -- 21 November 2026, per the brief's publish date.
    TIMESTAMPTZ '2026-11-21 09:00:00+05:30',
    'What Makes a Great Photograph? 7 Key Elements | Wandering Kite Photography',
    'Discover the 7 essential elements that separate an ordinary photo from a great one — light, composition, emotion, and more, explained simply.'
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

  -- ── S2 — the seven elements (carries the process image) ─────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'The 7 Elements of a Great Photograph',
    '<p>None of these work in isolation, but each one is worth understanding on its own before you start combining them.</p>',
    'RICH_TEXT',
    'Photographer adjusting camera settings while composing a shot',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, '1. Light',
   '<p>Light shapes everything in a photograph — mood, depth, and even the emotion a viewer feels looking at it.</p>'
   '<p>Soft, diffused light often feels gentle and intimate, while harsh, directional light can feel dramatic or bold.</p>'
   '<p>Understanding how light behaves is often the single biggest factor separating a flat image from a striking one.</p>',
   'RICH_TEXT', 0),
  (v_section_id, '2. Composition',
   '<p>How elements are arranged within the frame guides the viewer''s eye and creates visual balance.</p>'
   '<p>Simple principles like the rule of thirds, leading lines, and framing can turn an ordinary scene into a deliberately composed photograph.</p>',
   'RICH_TEXT', 1),
  (v_section_id, '3. Subject &amp; Focus',
   '<p>A great photograph usually has a clear subject — the viewer should know exactly where to look first.</p>'
   '<p>Sharp focus on the right element, paired with intentional use of depth of field, helps separate the subject from a distracting background.</p>',
   'RICH_TEXT', 2),
  (v_section_id, '4. Moment &amp; Emotion',
   '<p>Technical perfection alone doesn''t make a photograph memorable — the moment it captures does.</p>'
   '<p>A genuine laugh, a quiet glance, or an unscripted reaction often carries more impact than a perfectly posed but emotionally flat image.</p>',
   'RICH_TEXT', 3),
  (v_section_id, '5. Color &amp; Tone',
   '<p>Color influences mood just as much as light does.</p>'
   '<p>Warm tones often feel nostalgic or intimate, while cooler tones can feel calm or cinematic.</p>'
   '<p>Consistent color grading across a set of images also helps create a cohesive visual story.</p>',
   'RICH_TEXT', 4),
  (v_section_id, '6. Storytelling',
   '<p>The strongest photographs suggest a story beyond the single frame — a <em>"before"</em> and <em>"after"</em> the viewer can imagine.</p>'
   '<p>This is often what separates a technically good photo from one that actually stays with the viewer.</p>',
   'RICH_TEXT', 5),
  (v_section_id, '7. Technical Execution',
   '<p>None of the above matters if the fundamentals aren''t right — correct exposure, appropriate shutter speed, accurate white balance, and sharpness where it''s needed.</p>'
   '<p>Strong technical execution is what allows the creative elements to actually come through clearly.</p>',
   'RICH_TEXT', 6);

  -- ── S3 — bringing it all together ───────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Bringing It All Together',
    '<p>No single element makes a photograph great on its own — it''s the combination of good light, thoughtful composition, a clear subject, genuine emotion, intentional color, a sense of story, and solid technical execution working together.</p>'
    '<p>Understanding these elements doesn''t just help photographers improve their craft — it also helps clients recognize and appreciate the thought that goes into every photograph they receive.</p>',
    'RICH_TEXT', 1
  );

  -- ── S4 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'Which of these 7 elements matters most?',
   '<p>All seven work together, but light and moment/emotion are often considered the two that most affect how a photograph feels to the viewer.</p>', 0),
  (v_post_id, 'Can these elements be learned, or are they purely instinctive?',
   '<p>They can absolutely be learned. Understanding light, composition, and technical settings comes with practice and study, while an eye for emotion and storytelling develops over time through experience.</p>', 1),
  (v_post_id, 'Does Wandering Kite Photography apply these principles across all types of photography?',
   '<p>Yes. Whether it''s a wedding, portrait, or commercial shoot, these same core elements guide how every project is approached.</p>', 2);

  -- ── S5 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Want Photographs That Bring All 7 Elements Together?',
    '<p>Let''s talk about your next shoot — wedding, portrait, or commercial — and create images that do more than just look nice.</p>'
  ) RETURNING id INTO v_cta_id;

  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Explore Our Portfolio', '/photography', 0),
  (v_cta_id, 'Talk to Wandering Kite',
   'https://wa.me/917010092090?text=Hi%21%20I''d%20like%20to%20talk%20about%20an%20upcoming%20shoot.', 1);

END $$;

COMMIT;
