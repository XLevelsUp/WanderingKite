-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "How Lighting Changes the Quality of a Photoshoot".
--
-- Sixth studiospace blog post (after 00069's launch post, 00071's studio
-- selection guide, 00075's podcast recording guide, 00079's studio-vs-location
-- guide and 00080's multi-content session guide). section = 'STUDIO' so it
-- renders on /studiospace, not the photography blog. Same idempotent-on-slug
-- pattern: children deleted and reinserted on re-run.
--
-- Category note: the brief asked for "Equipment & Techniques", but
-- "BlogCategory" (00066) only allows WEDDING_EVENT / PORTRAITS_LIFESTYLE /
-- COMMERCIAL_BRAND / TIPS_INSIGHTS. TIPS_INSIGHTS is used here — this is a
-- technique guide, matching 00071/00075/00079/00080's studio guides.
--
-- published_at is now(); set an explicit timestamp to back-date or stage.
--
-- The featured image and the S2 in-post image are left NULL — upload them in
-- the dashboard (Blog → edit). Alt text is stored ready for when they are set.
--
-- CTA/link targets: /studiospace is the studio booking page. WhatsApp uses
-- the STUDIO number (siteConfig.contact.studioWhatsapp = 919025492090),
-- matching 00069/00071/00075/00079/00080 — not the photography number.
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
    'how-lighting-changes-quality-of-photoshoot',
    'How Lighting Changes the Quality of a Photoshoot',
    'STUDIO',
    'TIPS_INSIGHTS',
    'Professional studio lighting setup for a photoshoot in Coimbatore',
    '<p>A camera records the light that reaches its sensor. That makes lighting one of the most important parts of photography.</p>'
    '<p>The same subject can look completely different depending on where the light comes from, how soft it is, and how much contrast it creates.</p>'
    '<p>This is why professional photography is not simply about having a good camera.</p>'
    '<p>Understanding basic lighting can help photographers make better decisions about mood, shadows, highlights, background separation, and subject appearance.</p>'
    '<p>Whether you are photographing a person, product, or brand, learning how to control light can improve the consistency of your images.</p>',
    'Studio Space Coimbatore Team',
    ARRAY[
      'Studio Lighting Coimbatore',
      'Photography Studio Lighting',
      'Studio Photography Lighting',
      'Photoshoot Lighting',
      'Professional Photography Studio',
      'Lighting Setup for Photography',
      'Studio Space Coimbatore'
    ],
    7,
    now(),
    'How Lighting Changes Photoshoot Quality | Studio Space Coimbatore',
    'Learn how light direction, softness, shadows, contrast, and background lighting can change the quality and mood of your studio photographs.'
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

  -- ── S2 (carries the in-post image: lighting-direction comparison) ───────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'How Does Lighting Affect a Photograph?',
    '<p>Lighting influences much more than brightness.</p>',
    'RICH_TEXT',
    'Different studio lighting directions used for photography',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Direction of Light',
   '<p>The direction from which light reaches the subject changes the appearance of the image.</p>'
   '<p>Light can come from:</p>'
   '<ul>'
   '<li>Front</li>'
   '<li>Side</li>'
   '<li>Above</li>'
   '<li>Behind</li>'
   '<li>Different angles around the subject</li>'
   '</ul>'
   '<p>Front lighting can reduce visible shadows, while side lighting can create stronger shape and depth. Backlighting can create separation and silhouettes depending on how the exposure is handled.</p>'
   '<p>There is no single correct direction. The choice depends on the visual result you want.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Hard Light vs Soft Light',
   '<p>The size and position of a light source affect the softness of shadows.</p>'
   '<p>A larger light source placed relatively close to the subject generally produces softer transitions. Harder light can create stronger shadows and more defined highlights.</p>'
   '<p>Soft light is often useful for portraits when a smoother appearance is desired, while harder light can be useful when stronger contrast and texture are part of the visual style.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Lighting Changes the Mood',
   '<p>Lighting can influence how an image feels.</p>'
   '<p>Different combinations of brightness, shadow, direction, and contrast can create visual impressions such as:</p>'
   '<ul>'
   '<li>Clean</li>'
   '<li>Bright</li>'
   '<li>Dramatic</li>'
   '<li>Soft</li>'
   '<li>Professional</li>'
   '<li>Cinematic</li>'
   '<li>High contrast</li>'
   '</ul>'
   '<p>The lighting approach should support the purpose of the photograph rather than simply making everything equally bright.</p>',
   'BULLET_LIST', 2),
  (v_section_id, 'Lighting Helps Separate the Subject',
   '<p>Lighting can also help separate a subject from the background.</p>'
   '<p>For example, a controlled background light or rim light can create visual separation between the subject and the background.</p>'
   '<p>This can be useful for portraits, commercial photography, interviews, and content creation.</p>',
   'RICH_TEXT', 3);

  -- ── S3 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'How to Build a Simple Studio Lighting Setup',
    '<p>Start small and add light only where it serves a purpose.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Start With the Main Light',
   '<p>The first light should establish the primary illumination on your subject. This is commonly referred to as the key light.</p>'
   '<p>Its position affects:</p>'
   '<ul>'
   '<li>Shadow direction</li>'
   '<li>Facial definition</li>'
   '<li>Contrast</li>'
   '<li>Subject brightness</li>'
   '</ul>'
   '<p>Start with one light and understand its effect before adding more.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Add Control With a Second Light',
   '<p>A second light can be used to control shadows or illuminate another part of the scene.</p>'
   '<p>Depending on the setup, it may be used to:</p>'
   '<ul>'
   '<li>Reduce contrast</li>'
   '<li>Separate the subject</li>'
   '<li>Illuminate the background</li>'
   '<li>Add another layer of visual depth</li>'
   '</ul>'
   '<p>More lights do not automatically mean better photographs. Each light should have a clear purpose.</p>',
   'BULLET_LIST', 1),
  (v_section_id, 'Consider the Background',
   '<p>The background should not be treated separately from the subject.</p>'
   '<p>Lighting the background differently can change how the entire photograph appears.</p>'
   '<p>A brighter background can create a cleaner look, while a darker background can increase contrast and focus attention on the subject.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'Watch the Shadows and Highlights',
   '<p>After positioning the lights, look carefully at the shadows and brightest areas.</p>'
   '<p>Check:</p>'
   '<ul>'
   '<li>Are important facial details visible?</li>'
   '<li>Are highlights too bright?</li>'
   '<li>Are shadows too deep?</li>'
   '<li>Is the subject separated from the background?</li>'
   '<li>Does the lighting match the intended mood?</li>'
   '</ul>'
   '<p>Small adjustments to light position can sometimes create a significant difference.</p>',
   'BULLET_LIST', 3),
  (v_section_id, 'Quick Checklist',
   '<p>Before starting your photoshoot, check:</p>'
   '<ul>'
   '<li>What is the purpose of the photograph?</li>'
   '<li>Where should the main light come from?</li>'
   '<li>Do you need soft or harder light?</li>'
   '<li>What should the background look like?</li>'
   '<li>Are the shadows intentional?</li>'
   '<li>Are highlights under control?</li>'
   '<li>Does the subject separate from the background?</li>'
   '<li>Does the lighting support the desired mood?</li>'
   '</ul>',
   'BULLET_LIST', 4),
  (v_section_id, 'Photography at Studio Space Coimbatore',
   '<p>A dedicated studio environment can make lighting easier to experiment with because the photographer can work in a controlled space.</p>'
   '<p><a href="/studiospace">Studio Space Coimbatore</a> provides an environment where photographers and creators can plan their shoots around their required setup and production workflow.</p>'
   '<p>Whether the project involves portraits, commercial photography, content creation, or other controlled shoots, understanding the purpose of each light is more important than simply using more equipment.</p>'
   '<p>Good lighting begins with a clear visual intention.</p>',
   'RICH_TEXT', 5);

  -- ── S4 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'Why is lighting important in photography?',
   '<p>Lighting determines how the subject, shadows, highlights, textures, and background appear in the final photograph.</p>', 0),
  (v_post_id, 'Is natural light enough for photography?',
   '<p>Natural light can be excellent for photography, but it changes with time, weather, and location. Studio lighting provides greater control and consistency.</p>', 1),
  (v_post_id, 'Is soft light better than hard light?',
   '<p>Neither is universally better. Soft and hard light create different visual effects and can be selected according to the purpose and style of the photograph.</p>', 2),
  (v_post_id, 'How many lights do I need for a photoshoot?',
   '<p>There is no fixed number. A single well-positioned light can create an effective photograph. Additional lights should be added when they serve a specific purpose.</p>', 3),
  (v_post_id, 'Can beginners learn studio lighting?',
   '<p>Yes. Starting with one light and learning how its direction, distance, and size affect the subject is a practical way to understand studio lighting.</p>', 4);

  -- ── S5 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Planning a Photoshoot in a Controlled Environment?',
    '<p>Good lighting is not about using the most equipment. It is about understanding what the light is doing and using it intentionally.</p>'
    '<p>Experiment with direction, softness, contrast, and background lighting to find the visual approach that suits your project.</p>'
    '<p>Explore Studio Space Coimbatore for your next photography session.</p>'
  ) RETURNING id INTO v_cta_id;

  -- /studiospace is the studio booking page. WhatsApp uses the STUDIO number
  -- (919025492090), matching 00069/00071/00075/00079/00080.
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Explore Studio Space', '/studiospace', 0),
  (v_cta_id, 'Plan Your Photoshoot',
   'https://wa.me/919025492090?text=Hi%21%20I%27d%20like%20to%20plan%20a%20photoshoot%20at%20the%20studio.', 1),
  (v_cta_id, 'Check Availability',
   'https://wa.me/919025492090?text=Hi%21%20I%20want%20to%20check%20studio%20availability.', 2);

END $$;

COMMIT;
