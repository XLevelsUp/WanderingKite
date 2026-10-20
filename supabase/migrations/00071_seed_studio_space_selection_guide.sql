-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "How to Choose the Right Studio Space for Your Photoshoot" post.
--
-- Second studiospace blog post (after 00069's launch post). Same pattern:
-- idempotent on slug, children deleted and reinserted on re-run, matching
-- the admin form's save behaviour.
--
-- The featured image and the S2 in-post image are left NULL — upload them
-- in the dashboard (Blog → edit). Alt text is stored ready for when they
-- are set.
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
    'how-to-choose-studio-space-in-coimbatore',
    'How to Choose the Right Studio Space for Your Photoshoot',
    'STUDIO',
    'TIPS_INSIGHTS',
    'Professional photoshoot inside a studio space in Coimbatore',
    '<p>A great photoshoot does not begin when the camera is switched on. It begins with choosing the right environment for the shoot.</p>'
    '<p>The studio you select can affect your lighting, camera setup, movement, equipment, workflow, and even how comfortably the entire team can work. A space that looks good in photographs may not necessarily be the right space for the requirements of your project.</p>'
    '<p>Whether you are planning a portrait session, product shoot, fashion shoot, brand campaign, or content production, understanding what to look for in a studio space in Coimbatore can help you make a better decision.</p>'
    '<p>In this guide, we''ll look at the important factors to consider before booking a studio for your next photoshoot.</p>',
    'Studio Space Coimbatore Team',
    ARRAY[
      'Studio Space Coimbatore',
      'Studio Rental',
      'Photography Studio',
      'Photoshoot',
      'Creative Studio'
    ],
    7,
    now(),
    'How to Choose a Studio Space in Coimbatore',
    'Learn what to consider when choosing a studio space in Coimbatore, from size and lighting to equipment, facilities, and your shoot requirements.'
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
    'What Should You Look For in a Studio Space?',
    '<p>Choosing a studio should start with the requirements of your shoot rather than simply choosing the first available space.</p>'
    '<p>Every project is different. A small portrait session may need a simple setup, while a commercial production may require more space for cameras, lighting, equipment, subjects, and a larger team.</p>'
    '<p>The right studio should give you enough flexibility to work with your planned setup.</p>',
    'RICH_TEXT',
    'Professional studio setup with photography equipment and lighting in Coimbatore',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Consider the Size and Layout',
   '<p>The size of a studio is one of the first things to consider.</p>'
   '<p>A space needs to accommodate more than the person or product being photographed. You also need to consider the camera position, lighting equipment, crew, props, backgrounds, and movement.</p>'
   '<p>A studio with a practical layout can make it easier to:</p>'
   '<ul>'
   '<li>Position cameras and lights</li>'
   '<li>Move equipment during the shoot</li>'
   '<li>Create different compositions</li>'
   '<li>Work with multiple people</li>'
   '<li>Change setups efficiently</li>'
   '<li>Maintain a comfortable working environment</li>'
   '</ul>'
   '<p>Before booking, think about the complete setup rather than looking only at the total floor area.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Look at the Lighting Environment',
   '<p>Lighting can completely change the appearance of a photograph.</p>'
   '<p>Depending on the project, you may need controlled artificial lighting, natural light, or a combination of different lighting techniques.</p>'
   '<p>A suitable studio should allow the photographer to control the lighting according to the creative direction. Consider:</p>'
   '<ul>'
   '<li>Available lighting equipment</li>'
   '<li>Positioning of lights</li>'
   '<li>Space between the subject and light source</li>'
   '<li>Natural light availability</li>'
   '<li>Ability to create different lighting setups</li>'
   '<li>Space for modifiers and accessories</li>'
   '</ul>'
   '<p>The more control you have over the environment, the more freedom you have to experiment with the final image.</p>',
   'BULLET_LIST', 1),
  (v_section_id, 'Check the Available Facilities',
   '<p>A studio is more useful when its facilities match the requirements of your production.</p>'
   '<p>Before booking, understand what the studio provides and what you need to bring yourself. Depending on the type of project, this could include:</p>'
   '<ul>'
   '<li>Lighting equipment</li>'
   '<li>Camera and lens requirements</li>'
   '<li>Backgrounds</li>'
   '<li>Furniture or props</li>'
   '<li>Power availability</li>'
   '<li>Changing facilities</li>'
   '<li>Audio equipment</li>'
   '<li>Other studio accessories</li>'
   '</ul>'
   '<p>This is particularly important when you are working with a team or planning a production that involves multiple pieces of equipment. You don''t want to discover an important limitation after the shoot has already started.</p>',
   'BULLET_LIST', 2),
  (v_section_id, 'Think About the Type of Shoot',
   '<p>Not every studio is suitable for every project.</p>'
   '<p>A photographer working on a portrait session may have different requirements from someone creating a product campaign or a brand video. For example:</p>'
   '<ul>'
   '<li>Portrait photography may require suitable lighting, backgrounds, and space for the subject.</li>'
   '<li>Product photography may require controlled lighting, clean backgrounds, and enough space for equipment.</li>'
   '<li>Fashion photography may require more room for models, movement, styling, and creative setups.</li>'
   '<li>Brand content may require flexibility to create multiple images or videos within the same session.</li>'
   '</ul>'
   '<p>Understanding your project before booking helps you choose a studio that actually supports the work you want to create.</p>',
   'BULLET_LIST', 3);

  -- ── S3 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'How to Choose the Right Studio for Your Project',
    '<p>A studio may have excellent facilities, but that does not automatically mean it is the right choice for your particular shoot.</p>'
    '<p>Start by understanding what your production needs and then compare the available studio options.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Start With Your Shoot Requirements',
   '<p>Before searching for a studio, make a simple list of what your shoot requires. Consider:</p>'
   '<ul>'
   '<li>What are you photographing or filming?</li>'
   '<li>How many people will be involved?</li>'
   '<li>How much equipment will you use?</li>'
   '<li>Do you need specific lighting?</li>'
   '<li>Do you need backgrounds or props?</li>'
   '<li>How much space will the camera and crew require?</li>'
   '<li>How long will the shoot take?</li>'
   '</ul>'
   '<p>Having these answers makes the selection process much easier.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Check What Is Included',
   '<p>Do not assume that every studio rental includes the same facilities.</p>'
   '<p>Ask about what is available as part of the booking and what may require additional arrangements.</p>'
   '<p>A useful way to evaluate a studio is:</p>'
   '<p><strong>Space + Facilities + Equipment + Flexibility + Accessibility</strong></p>'
   '<p>This gives you a clearer picture of whether the studio can support your complete production.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Consider Your Workflow',
   '<p>A professional shoot involves more than taking photographs.</p>'
   '<p>There may be equipment setup, lighting adjustments, styling, preparation, shooting, reviewing images, changing setups, and packing everything away.</p>'
   '<p>A practical studio environment can help make this process smoother. The goal should be to spend your time working on the creative process rather than dealing with avoidable space or setup problems.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'Think Beyond One Shoot',
   '<p>If you regularly create photography or content, finding a studio that can accommodate different types of projects can be valuable.</p>'
   '<p>One project may require a simple portrait setup. Another may require product photography. Another could involve video, reels, interviews, or brand content.</p>'
   '<p>A flexible studio space in Coimbatore can therefore become a useful creative environment for different kinds of productions rather than being limited to one specific type of shoot.</p>',
   'RICH_TEXT', 3),
  (v_section_id, 'Quick Checklist',
   '<p>Before booking a studio, ask:</p>'
   '<ul>'
   '<li>Is the studio large enough for my complete setup?</li>'
   '<li>Does the lighting environment suit my project?</li>'
   '<li>What equipment and facilities are available?</li>'
   '<li>Can I bring my own equipment?</li>'
   '<li>Is there enough space for my team and subjects?</li>'
   '<li>Does the studio support the type of photography or content I am creating?</li>'
   '<li>Is the location practical for everyone involved?</li>'
   '<li>Do I have enough booking time for setup, shooting, and packing?</li>'
   '</ul>',
   'BULLET_LIST', 4),
  (v_section_id, 'Studio Space Coimbatore',
   '<p>Studio Space Coimbatore is created for photographers, creators, brands, and production teams looking for a practical environment for their creative work.</p>'
   '<p>The idea is to provide more than simply a room to place a camera. The space is designed around the practical requirements that can arise during photography, video production, content creation, and other studio-based projects.</p>'
   '<p>Whether you are planning a photoshoot, creating brand content, producing social media visuals, or working on a larger creative project, choosing a studio should always begin with understanding what your production actually needs.</p>',
   'RICH_TEXT', 5);

  -- ── S4 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'What should I consider before booking a studio space?',
   '<p>Consider the studio size, layout, lighting, available facilities, equipment, accessibility, and whether the space is suitable for your specific type of shoot.</p>', 0),
  (v_post_id, 'Is every photography studio suitable for every type of photoshoot?',
   '<p>No. Different projects have different requirements. Portrait, product, fashion, commercial, and content shoots may require different amounts of space, lighting, equipment, and flexibility.</p>', 1),
  (v_post_id, 'Why is studio size important for photography?',
   '<p>Studio size affects camera positioning, lighting placement, subject movement, equipment setup, and how comfortably the photographer and production team can work.</p>', 2),
  (v_post_id, 'Should I check the equipment before booking a studio?',
   '<p>Yes. Understanding which equipment and facilities are available can help you prepare properly and avoid unexpected limitations during the shoot.</p>', 3),
  (v_post_id, 'How do I choose a studio for a commercial photoshoot?',
   '<p>Start by identifying the project''s requirements, including the number of people involved, equipment, lighting, space, backgrounds, and expected production time. Then select a studio that can accommodate those requirements.</p>', 4);

  -- ── S5 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Planning your next photoshoot in Coimbatore?',
    '<p>The right studio can give you the space, facilities, and working environment needed to focus on your creative process.</p>'
    '<p>Explore Studio Space Coimbatore and find a professional environment for your next photography, video, or content production project.</p>'
  ) RETURNING id INTO v_cta_id;

  -- Same verified targets as 00069: no /contact page (WhatsApp is the
  -- contact channel), no #pricing anchor on /studiospace.
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Explore Studio Space', '/studiospace', 0),
  (v_cta_id, 'Check Availability',
   'https://wa.me/919025492090?text=Hi%21%20I%20want%20to%20check%20studio%20availability.', 1),
  (v_cta_id, 'Contact Us',
   'https://wa.me/919025492090?text=Hi%21%20I%20have%20a%20question%20about%20the%20studio%20space.', 2);

END $$;

COMMIT;
