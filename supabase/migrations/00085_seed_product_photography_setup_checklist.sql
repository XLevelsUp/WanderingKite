-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "Product Photography Setup: A Practical Checklist Before Your Shoot"
--
-- STUDIO-section blog post (section = 'STUDIO', category = 'TIPS_INSIGHTS').
--
-- NOTE this is a studiospace post, unlike 00082–00084 which are photography
-- posts. The brief is written for Studio Space Coimbatore (it promotes the
-- RS Puram studio, its infinity wall and backdrops, and links to the studio
-- lighting post seeded in 00081, which is itself 'STUDIO'). It therefore
-- renders under /studiospace/blog, not /blog, and follows 00081's
-- conventions rather than the photography ones:
--
--   * CTA route is /studiospace
--   * WhatsApp uses the STUDIO number (siteConfig.contact.studioWhatsapp,
--     919025492090) — NOT the photography number 917010092090 used in
--     00082–00084
--
-- The brief's trailing metadata says "Category: Photography", which is the
-- subject matter, not a BlogCategory enum value. Mapped to TIPS_INSIGHTS,
-- matching 00081 — the companion lighting post this one links to. If you
-- would rather file it under STUDIO_PHOTOGRAPHY (added in 00068), change the
-- category here; no ALTER TYPE is needed either way.
--
-- Same idempotent-on-slug pattern as 00074–00084: children are deleted and
-- reinserted on re-run, matching the admin form's save behaviour.
--
-- Images: the featured image and the S2 behind-the-scenes image are left
-- NULL — upload them in the dashboard (Blog → edit). Alt text is stored now
-- so it is in place the moment an image is set. The brief's captions have no
-- column on blog_sections, so they are not stored.
--
-- The S2.S3 cross-link points at the 00081 lighting post. That migration must
-- be applied for the link to resolve; if it has not run yet the href simply
-- 404s until it does.
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
    'product-photography-setup-checklist',
    'Product Photography Setup: A Practical Checklist Before Your Shoot',
    'STUDIO',
    'TIPS_INSIGHTS',
    'Product photography setup with camera, studio lighting and a clean background in Coimbatore.',
    '<p>Product photography is more than placing an item in front of a camera. The background, lighting, camera angle and product arrangement all influence how the final image looks.</p>'
    '<p>For businesses, these photographs may appear on websites, online stores, social media posts, catalogues and advertisements. Consistent product images help customers understand the product and see important details clearly.</p>'
    '<p>Preparing your setup before the shoot can save time and reduce unnecessary retakes. Whether you are photographing jewellery, cosmetics, clothing, electronics or handmade products, a simple checklist can help you work more efficiently.</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Product Photography Coimbatore',
      'Product Photoshoot Setup',
      'Product Photography Lighting',
      'Product Photography Studio',
      'Product Photography Checklist',
      'Studio Space Coimbatore'
    ],
    6,
    now(),
    'Product Photography Setup Checklist | Coimbatore',
    'Learn how to prepare for a product photoshoot with practical tips on lighting, backgrounds, camera angles, equipment and shot planning.'
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

  -- ── S2 — what to prepare (carries the behind-the-scenes image) ──────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'What Should You Prepare Before a Product Photoshoot?',
    '<p>Most of the work that makes a product shoot go smoothly happens before the first photograph is taken.</p>'
    '<p>These four areas are worth settling in advance.</p>',
    'RICH_TEXT',
    'Behind-the-scenes product photography with a camera and controlled studio lighting.',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Clean and Prepare the Product',
   '<p>Start by checking the product carefully.</p>'
   '<p>Remove dust, fingerprints, packaging marks and loose threads. Reflective products such as jewellery, glassware and polished metal may reveal small marks that are difficult to notice with the naked eye.</p>'
   '<p>Prepare any accessories or supporting objects you intend to include in the frame. Keep them relevant to the product rather than adding unnecessary decoration.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Choose the Right Background',
   '<p>Your background should support the product, not compete with it.</p>'
   '<p>A white or neutral background can work well for catalogue images. A coloured background may suit a campaign or brand-focused visual. Textured surfaces and props can help communicate a product''s use or personality.</p>'
   '<p>Before the shoot, decide whether you need clean catalogue photographs, lifestyle-style images or creative promotional visuals.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Plan the Lighting',
   '<p>Lighting affects colour, texture, reflections and shadows.</p>'
   '<p>Soft lighting can be useful for cosmetics, clothing and products with delicate surfaces. More directional lighting may help reveal texture and shape. Reflective objects often require careful light placement to control unwanted reflections.</p>'
   '<p>Start with one main light, review the result, and add other lights only when they serve a purpose. For more guidance, read <a href="/studiospace/blog/how-lighting-changes-quality-of-photoshoot">How Lighting Changes the Quality of a Photoshoot</a>.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'Decide Your Camera Angles',
   '<p>Different angles communicate different information.</p>'
   '<p>For a typical product shoot, consider capturing:</p>'
   '<ul>'
   '<li>A front or hero image.</li>'
   '<li>A three-quarter angle showing depth.</li>'
   '<li>Close-up images of important details.</li>'
   '<li>A side or rear view when relevant.</li>'
   '<li>A lifestyle image showing the product in context.</li>'
   '</ul>'
   '<p>For online catalogues, keep framing and image dimensions consistent across similar products.</p>',
   'BULLET_LIST', 3);

  -- ── S3 — how to organise the shoot ──────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'How to Organise a Product Photoshoot',
    '<p>Preparation covers the setup. Organisation covers the session itself — what you shoot, in what order, and how you check it as you go.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Create a Shot List',
   '<p>Write down the photographs you need before the shoot begins. Group similar products together and identify the most important images first.</p>'
   '<p>A shot list prevents you from finishing the session only to discover that a required detail or angle is missing.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Check the Camera and Equipment',
   '<p>Check your camera battery, memory cards, tripod, lens and lighting equipment. If you are using a tripod, confirm that the product and frame remain properly aligned between shots.</p>'
   '<p>A professional studio space in Coimbatore can provide a controlled environment with lighting equipment and multiple backdrop options. Confirm the facilities and equipment included in your booking before planning the shoot.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Review Colour and Focus',
   '<p>Take test photographs before producing the full set. Check focus, exposure, white balance, reflections and background cleanliness.</p>'
   '<p>If colour accuracy matters, use a consistent lighting setup and review the results on a suitable display. Avoid relying entirely on your camera''s small screen.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'Plan for Editing',
   '<p>Capture images with enough space for cropping and different placements. Website banners, product listings and social media posts may need different aspect ratios.</p>'
   '<p>Keep original files organised and use a consistent naming system so that the final images are easy to locate.</p>',
   'RICH_TEXT', 3),
  (v_section_id, 'Quick Checklist',
   '<p>Before the shoot, confirm:</p>'
   '<ul>'
   '<li>Products are clean and ready.</li>'
   '<li>Backgrounds and props are prepared.</li>'
   '<li>Lighting setup has been tested.</li>'
   '<li>Camera, lens and tripod are ready.</li>'
   '<li>Required angles are listed.</li>'
   '<li>Colour and focus have been checked.</li>'
   '<li>Files and final image formats are planned.</li>'
   '</ul>',
   'BULLET_LIST', 4),
  (v_section_id, 'Product Photography at Studio Space Coimbatore',
   '<p>A controlled studio environment can make it easier to manage lighting, backgrounds and camera positions. Studio Space Coimbatore offers a photography studio in RS Puram with an infinity wall, multiple backdrops and professional lighting facilities.</p>'
   '<p>Choose your setup according to the product, the desired visual style and the images you need to deliver. Confirm equipment availability and booking details before your session.</p>',
   'RICH_TEXT', 5);

  -- ── S4 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'What equipment is needed for product photography?',
   '<p>A camera, suitable lens, tripod, lighting and a clean background are useful starting points. The exact equipment depends on the product and the intended result.</p>', 0),
  (v_post_id, 'Is a studio necessary for product photography?',
   '<p>Not always. Small products can be photographed at home with suitable lighting and space. A studio can be useful when you need controlled lighting, multiple backgrounds or repeatable results.</p>', 1),
  (v_post_id, 'Which background is best for product photography?',
   '<p>White and neutral backgrounds are common for catalogue images. Coloured or textured backgrounds can suit creative campaigns. Choose according to the product and where the image will be used.</p>', 2),
  (v_post_id, 'How can I make product photos look consistent?',
   '<p>Use a planned lighting arrangement, repeatable camera positions, consistent framing and a clear shot list. Review colour and exposure throughout the session.</p>', 3),
  (v_post_id, 'Should I edit product photographs after the shoot?',
   '<p>Editing can help refine exposure, crop images and remove minor distractions. Product colour and features should remain accurate, particularly for e-commerce listings.</p>', 4);

  -- ── S5 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Good Product Photographs Begin With Good Preparation',
    '<p>Plan your shot list, prepare your products and select a setup that suits your visual requirements.</p>'
    '<p>If you need a controlled environment for your next product shoot, explore Studio Space Coimbatore.</p>'
  ) RETURNING id INTO v_cta_id;

  -- Studio CTA conventions, matching 00081: /studiospace and the STUDIO
  -- WhatsApp number (919025492090).
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Explore Studio Space', '/studiospace', 0),
  (v_cta_id, 'Plan Your Product Shoot',
   'https://wa.me/919025492090?text=Hi%21%20I%27d%20like%20to%20plan%20a%20product%20shoot%20at%20the%20studio.', 1),
  (v_cta_id, 'Check Availability',
   'https://wa.me/919025492090?text=Hi%21%20I%20want%20to%20check%20studio%20availability.', 2);

END $$;

COMMIT;
