-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "Studio vs Location Shoot: Which Is Better for Your Video?".
--
-- Fourth studiospace blog post (after 00069's launch post, 00071's studio
-- selection guide and 00075's podcast recording guide). section = 'STUDIO'
-- so it renders on /studiospace, not the photography blog. Same idempotent-
-- on-slug pattern: children deleted and reinserted on re-run.
--
-- Category note: the brief asked for "Video Production", but "BlogCategory"
-- (00066) only allows WEDDING_EVENT / PORTRAITS_LIFESTYLE / COMMERCIAL_BRAND /
-- TIPS_INSIGHTS. TIPS_INSIGHTS is used here — this is a decision guide, and
-- it matches 00071/00075's studio guides.
--
-- published_at is now(); set an explicit timestamp to back-date or stage.
--
-- The featured image and the S2 in-post image are left NULL — upload them in
-- the dashboard (Blog → edit). Alt text is stored ready for when they are set.
--
-- CTA/link targets: /studiospace is the studio booking page. WhatsApp uses
-- the STUDIO number (siteConfig.contact.studioWhatsapp = 919025492090),
-- matching 00069/00071/00075 — not the photography number.
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
    'studio-vs-location-shoot',
    'Studio vs Location Shoot: Which Is Better for Your Video?',
    'STUDIO',
    'TIPS_INSIGHTS',
    'Professional studio video production setup in Coimbatore',
    '<p>When planning a video shoot, one of the first decisions is where the production should take place.</p>'
    '<p>A studio provides a controlled environment with a predictable setup. A location shoot, on the other hand, allows the video to use a real environment as part of the story.</p>'
    '<p>Neither option is suitable for every type of project.</p>'
    '<p>A product video may benefit from controlled lighting and backgrounds, while a brand film may need a real workplace, outdoor setting, or specific location.</p>'
    '<p>Understanding the differences can help you choose the right environment before production begins.</p>',
    'Studio Space Coimbatore Team',
    ARRAY[
      'Studio Video Production Coimbatore',
      'Video Production Studio Coimbatore',
      'Studio vs Location Shoot',
      'Video Shoot Studio',
      'Professional Video Studio',
      'Video Production Coimbatore',
      'Studio Space Coimbatore'
    ],
    7,
    now(),
    'Studio vs Location Shoot: Which Is Better for Your Video?',
    'Studio or location shoot? Compare lighting, control, background, production time, and workflow to choose the right environment for your next video.'
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

  -- ── S2 (carries the in-post image: behind-the-scenes studio shoot) ──────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'What Is the Difference Between a Studio and Location Shoot?',
    '<p>The biggest difference is the level of control you have over the production environment.</p>',
    'RICH_TEXT',
    'Behind the scenes of a professional studio video shoot',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Control Over the Environment',
   '<p>A studio gives you greater control over the shooting environment.</p>'
   '<p>You can manage elements such as:</p>'
   '<ul>'
   '<li>Lighting</li>'
   '<li>Background</li>'
   '<li>Camera position</li>'
   '<li>Subject placement</li>'
   '<li>Noise</li>'
   '<li>Set arrangement</li>'
   '</ul>'
   '<p>With a location shoot, some of these elements may be difficult to control. Weather, surrounding activity, natural light, traffic, and other environmental factors can influence the production.</p>'
   '<p>For projects where consistency is important, a controlled studio environment can simplify the shoot.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Lighting Requirements',
   '<p>Lighting can change the entire appearance of a video.</p>'
   '<p>In a studio, artificial lighting can be arranged specifically for the subject and adjusted throughout the shoot.</p>'
   '<p>This can be useful for:</p>'
   '<ul>'
   '<li>Interviews</li>'
   '<li>Product videos</li>'
   '<li>Corporate videos</li>'
   '<li>Educational content</li>'
   '<li>Social media videos</li>'
   '<li>Talking-head videos</li>'
   '</ul>'
   '<p>Location shoots can make use of natural light, but the available light can change depending on the time, weather, and surroundings.</p>',
   'BULLET_LIST', 1),
  (v_section_id, 'Background and Visual Consistency',
   '<p>A studio allows the background to be planned around the purpose of the video.</p>'
   '<p>The background can be:</p>'
   '<ul>'
   '<li>Simple and clean</li>'
   '<li>Professional</li>'
   '<li>Creative</li>'
   '<li>Brand-focused</li>'
   '<li>Neutral</li>'
   '<li>Designed around the subject</li>'
   '</ul>'
   '<p>This can make multiple videos from the same production session look consistent.</p>'
   '<p>A location, meanwhile, can provide more context and visual storytelling. The right choice depends on whether the environment should support the story or remain visually controlled.</p>',
   'BULLET_LIST', 2),
  (v_section_id, 'Time and Production Efficiency',
   '<p>Location shoots can require additional preparation.</p>'
   '<p>You may need to consider:</p>'
   '<ul>'
   '<li>Travel</li>'
   '<li>Parking</li>'
   '<li>Permissions</li>'
   '<li>Weather</li>'
   '<li>Equipment transportation</li>'
   '<li>Setup and breakdown</li>'
   '<li>Background activity</li>'
   '</ul>'
   '<p>A studio can reduce some of these logistical requirements by bringing the production environment together in one place.</p>'
   '<p>This can be especially useful when the project involves several scenes, multiple people, or repeated content.</p>',
   'BULLET_LIST', 3);

  -- ── S3 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'How to Choose the Right Shooting Environment',
    '<p>A few practical questions can point you toward the environment that suits your project.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Start With the Purpose of the Video',
   '<p>First ask what the video needs to communicate.</p>'
   '<p>A studio may work well for:</p>'
   '<ul>'
   '<li>Interviews</li>'
   '<li>Product demonstrations</li>'
   '<li>Educational videos</li>'
   '<li>Corporate content</li>'
   '<li>Social media content</li>'
   '<li>Controlled promotional videos</li>'
   '</ul>'
   '<p>A location may be more suitable when the environment itself is important to the story.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Consider Your Production Requirements',
   '<p>Think about the number of people, equipment, scenes, and shooting angles required.</p>'
   '<p>A more complex production may benefit from having a controlled environment where the setup can remain consistent.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Think About Repeatability',
   '<p>If you plan to produce content regularly, consistency becomes important.</p>'
   '<p>Using a similar studio setup can help create a recognizable visual style across multiple videos.</p>'
   '<p>This can be useful for businesses, creators, educators, and personal brands producing content regularly.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'Consider Your Budget and Time',
   '<p>The decision should not be based only on the rental cost of the space.</p>'
   '<p>Consider the complete production process, including:</p>'
   '<ul>'
   '<li>Travel</li>'
   '<li>Equipment movement</li>'
   '<li>Setup time</li>'
   '<li>Crew requirements</li>'
   '<li>Location permissions</li>'
   '<li>Weather-related delays</li>'
   '<li>Production time</li>'
   '</ul>'
   '<p>Looking at the entire workflow can give you a clearer picture of which option suits your project.</p>',
   'BULLET_LIST', 3),
  (v_section_id, 'Quick Checklist',
   '<p>Before choosing your shooting environment, ask:</p>'
   '<ul>'
   '<li>Does the background matter to the story?</li>'
   '<li>Do I need controlled lighting?</li>'
   '<li>How many people are involved?</li>'
   '<li>How much equipment is required?</li>'
   '<li>Do I need multiple camera angles?</li>'
   '<li>Will weather affect the shoot?</li>'
   '<li>Do I need consistent visuals across multiple videos?</li>'
   '<li>How much setup and travel time is available?</li>'
   '</ul>',
   'BULLET_LIST', 4),
  (v_section_id, 'Video Production at Studio Space Coimbatore',
   '<p><a href="/studiospace">Studio Space Coimbatore</a> provides a dedicated environment for creators, businesses, photographers, and video production projects.</p>'
   '<p>For projects that require a controlled shooting environment, a studio can make it easier to manage lighting, backgrounds, camera positions, and production workflow.</p>'
   '<p>The right choice ultimately depends on the project. If the environment is part of the story, a location may be appropriate. If control, consistency, and production efficiency are priorities, a studio can provide a practical alternative.</p>',
   'RICH_TEXT', 5);

  -- ── S4 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'Is a studio better than a location for video production?',
   '<p>It depends on the project. Studios provide more control over lighting, sound, backgrounds, and setup, while locations can provide real-world context and natural environments.</p>', 0),
  (v_post_id, 'Which is better for interview videos?',
   '<p>A studio can be useful for interviews because the lighting, background, sound environment, and camera positions can be controlled more easily.</p>', 1),
  (v_post_id, 'Can a studio be used for social media videos?',
   '<p>Yes. A controlled studio can be used for reels, educational videos, interviews, promotional videos, and other forms of social media content.</p>', 2),
  (v_post_id, 'Are location shoots more complicated?',
   '<p>They can involve additional considerations such as travel, weather, permissions, surrounding activity, and equipment transportation.</p>', 3),
  (v_post_id, 'Should every video be filmed in a studio?',
   '<p>No. The shooting environment should be selected based on the purpose, story, visual requirements, and production workflow of the project.</p>', 4);

  -- ── S5 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Planning Your Next Video Shoot?',
    '<p>The right shooting environment can make a significant difference to your production workflow.</p>'
    '<p>Before choosing between a studio and a location, consider what your video actually needs — control, consistency, flexibility, natural surroundings, or visual storytelling.</p>'
    '<p>If your project requires a controlled production environment, explore the studio facilities available at Studio Space Coimbatore.</p>'
  ) RETURNING id INTO v_cta_id;

  -- /studiospace is the studio booking page. WhatsApp uses the STUDIO number
  -- (919025492090), matching 00069/00071/00075.
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Explore Studio Space', '/studiospace', 0),
  (v_cta_id, 'Plan Your Video Shoot',
   'https://wa.me/919025492090?text=Hi%21%20I%27d%20like%20to%20plan%20a%20video%20shoot%20at%20the%20studio.', 1),
  (v_cta_id, 'Check Availability',
   'https://wa.me/919025492090?text=Hi%21%20I%20want%20to%20check%20studio%20availability.', 2);

END $$;

COMMIT;
