-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "Why Studio Space Coimbatore Was Created" launch post.
--
-- Run AFTER 00068 (which adds the studio category enum values — Postgres
-- cannot add and use an enum value in the same transaction).
--
-- Idempotent: re-running replaces the post's content rather than duplicating
-- it. Children are deleted and reinserted, matching the admin form's save.
--
-- The featured image and the S2 in-post image are left NULL — upload them in
-- the dashboard (Blog → edit). Alt text is stored ready for when they are set.
-- Image captions are not part of the schema; the source content supplied them
-- but the agreed model is one image + alt text.
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
    'why-studio-space-coimbatore-was-created',
    'Why Studio Space Coimbatore Was Created: A Space Built From a Photographer''s Experience',
    'STUDIO',
    'STUDIO_SPACE',
    'Photographer working in a professional studio space in Coimbatore',
    '<p>For a photographer, every shoot begins with more than an idea. It often begins with a search for the right place.</p>'
    '<p>Over the years, travelling to different locations for photography can bring its own challenges. Finding a suitable location, arranging the required setup, managing equipment, and making sure the space actually supports the shoot can take considerable time and effort.</p>'
    '<p>Even after finding a studio space, another problem can remain: the space may be available, but the facilities and setup may not fully meet the requirements of the shoot.</p>'
    '<p>This experience became the inspiration behind Studio Space Coimbatore — creating a professional environment where photographers, creators, brands, and production teams can have a space designed around the practical needs of their work.</p>',
    'Studio Space Coimbatore Team',
    ARRAY[
      'Studio Space Coimbatore',
      'Studio Rental',
      'Photography Studio',
      'Creative Studio',
      'Content Creation'
    ],
    6,
    '2026-09-01T09:00:00+05:30',
    'Why Studio Space Coimbatore Was Created',
    'Discover the story behind Studio Space Coimbatore and how a photographer''s experience inspired the creation of a practical space for creators.'
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

  -- ── S2 (carries the second in-post image) ───────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'Why Was Studio Space Coimbatore Created?',
    '<p>A studio may look good from the outside, but for someone working behind the camera, what matters is how well the space works during an actual production.</p>'
    '<p>Different photography and content projects have different requirements. A portrait shoot may need a controlled environment and suitable lighting. A product shoot may require a clean setup and enough working space. A video or content production may require room for cameras, lights, crew, and movement.</p>'
    '<p>The challenge faced by the founder was not simply finding a place to shoot. It was finding a place that could actually support the complete requirement of the shoot.</p>',
    'RICH_TEXT',
    'Wide professional studio space with photography and content creation facilities in Coimbatore',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'The Problem Behind the Idea',
   '<ul>'
   '<li><strong>Travelling between locations</strong> — Different projects often meant travelling to different places to find a suitable shooting environment.</li>'
   '<li><strong>Limited studio facilities</strong> — Some available spaces provided the room but did not offer everything required for the planned production.</li>'
   '<li><strong>Different project requirements</strong> — Every shoot has its own requirements, making a one-size-fits-all studio experience difficult.</li>'
   '<li><strong>Creative compromises</strong> — When the space does not support the production, photographers and creators may have to change or compromise their original ideas.</li>'
   '</ul>'
   '<p>These experiences led to a simple thought: <em>why keep searching for a space when you can create one around the needs of the people using it?</em></p>',
   'BULLET_LIST', 0);

  -- ── S3 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'From a Photographer''s Challenge to a Creative Space',
    '<p>The idea behind Studio Space Coimbatore started with understanding the challenges from a photographer''s point of view.</p>'
    '<p>A professional studio is more than an empty room. The space needs to support the entire process — from setting up the equipment to creating the final image or video.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Space That Supports the Shoot',
   '<p>The size and layout of a studio can affect how comfortably a photographer or production team can work. There should be enough room for:</p>'
   '<ul>'
   '<li>Camera and lighting setups</li>'
   '<li>Subjects, models, or products</li>'
   '<li>Movement during the shoot</li>'
   '<li>Crew and production equipment</li>'
   '<li>Different creative setups</li>'
   '</ul>'
   '<p>The right amount of space gives creators more flexibility to approach a project in different ways.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Facilities Should Match the Requirement',
   '<p>Having a studio space is only one part of the experience.</p>'
   '<p>Depending on the project, creators may need appropriate facilities and a working environment that helps them execute their ideas efficiently.</p>'
   '<p>The objective behind Studio Space Coimbatore is therefore not simply to provide a place to rent. It is to create a more practical environment where photography, video production, content creation, and other creative work can happen with fewer location-related limitations.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'A Space for Different Creators',
   '<p>A professional studio can serve different types of creative work. It can be used for:</p>'
   '<ul>'
   '<li>Photography</li>'
   '<li>Product shoots</li>'
   '<li>Portrait sessions</li>'
   '<li>Fashion shoots</li>'
   '<li>Brand content</li>'
   '<li>Video production</li>'
   '<li>Social media content</li>'
   '<li>Reels and digital content</li>'
   '<li>Creative projects</li>'
   '</ul>'
   '<p>The exact requirements may change from one project to another, but the need remains the same: a space that works with the creative process, not against it.</p>',
   'BULLET_LIST', 2);

  -- ── S4 — checklist ──────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'What Makes a Studio Space Practical?',
    '<p>Before choosing a studio rental in Coimbatore, creators should look beyond the appearance of the space.</p>'
    '<ul>'
    '<li><strong>Space and layout</strong> — Is there enough room for your camera, lighting, subjects, crew, and equipment?</li>'
    '<li><strong>Facilities</strong> — Does the studio provide the facilities required for your type of shoot?</li>'
    '<li><strong>Flexibility</strong> — Can the space accommodate different types of creative projects?</li>'
    '<li><strong>Accessibility</strong> — Is the location practical for your team, clients, models, and equipment?</li>'
    '<li><strong>Working environment</strong> — Can your team work comfortably and efficiently during the production?</li>'
    '<li><strong>Shoot requirements</strong> — Does the studio match the specific needs of your project?</li>'
    '</ul>'
    '<p>A good studio should reduce unnecessary complications and allow creators to spend more time focusing on the work itself.</p>',
    'BULLET_LIST', 2
  );

  -- ── S5 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'The Idea Behind Studio Space Coimbatore',
    '<p>Studio Space Coimbatore was born from a real experience — the experience of a photographer who understood how difficult it can be to keep travelling and searching for suitable locations, only to discover that the available studio does not completely fulfil the requirements of the project.</p>'
    '<p>Instead of accepting those limitations, the idea was to create a space with the creator in mind.</p>'
    '<p>The vision is simple: <strong>create a professional space where people can come with an idea and have an environment that helps them bring it to life.</strong></p>'
    '<p>It is not about creating a space simply because creators need somewhere to shoot. It is about understanding why they need the space and designing the experience around that requirement.</p>',
    'RICH_TEXT', 3
  );

  -- ── S6 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'Why was Studio Space Coimbatore created?',
   '<p>Studio Space Coimbatore was inspired by the founder''s experience as a photographer and the challenges of travelling to different locations and finding studio spaces that did not always meet the complete requirements of a shoot.</p>', 0),
  (v_post_id, 'Is Studio Space Coimbatore only for photographers?',
   '<p>No. The space can be suitable for different creative requirements, including photography, video production, content creation, product shoots, brand content, and other studio-based projects.</p>', 1),
  (v_post_id, 'What should I consider before booking a studio?',
   '<p>Consider the studio''s space, layout, facilities, accessibility, working environment, and whether it can support the specific requirements of your project.</p>', 2),
  (v_post_id, 'Why is the right studio space important?',
   '<p>The right space can make the production process more practical by providing an environment that supports the equipment, people, setup, and creative requirements of the shoot.</p>', 3),
  (v_post_id, 'What is the vision behind Studio Space Coimbatore?',
   '<p>The vision is to create a professional and practical creative environment where photographers, creators, brands, and production teams can focus on their work without unnecessary location-related limitations.</p>', 4);

  -- ── S7 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Looking for a professional studio space in Coimbatore?',
    '<p>Whether you''re planning a photoshoot, product shoot, video production, or content project, the right environment can make the creative process easier.</p>'
    '<p>Explore Studio Space Coimbatore and find a space designed with the needs of creators in mind.</p>'
  ) RETURNING id INTO v_cta_id;

  -- Targets verified against live routes: there is no /contact page (the site
  -- contacts via WhatsApp — studio number per config/site.ts) and /studiospace
  -- has no #pricing anchor, so availability points at the podcast studio page
  -- alongside the main studio page.
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Explore the Studio', '/studiospace', 0),
  (v_cta_id, 'Podcast Studio',     '/podcast',     1),
  (v_cta_id, 'Check Availability',
   'https://wa.me/919025492090?text=Hi%21%20I%20want%20to%20book%20the%20studio%20space.', 2);

END $$;

COMMIT;
