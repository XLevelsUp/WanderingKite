-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "How to Choose the Right Camera Lens for Your Shoot"
--
-- STUDIO-section blog post (section = 'STUDIO', category =
-- 'EQUIPMENT_TECHNIQUES'). Like 00085 this is a Studio Space post, not a
-- photography one: it promotes the studio's equipment add-ons and links to
-- the studio lighting post from 00081. It renders under /studiospace/blog
-- and uses the STUDIO WhatsApp number (siteConfig.contact.studioWhatsapp,
-- 919025492090), NOT the photography number used in 00082–00084.
--
-- CATEGORY: the brief says "Equipment & Techniques", which maps exactly to
-- EQUIPMENT_TECHNIQUES — added by 00068 and already labelled
-- "Equipment & Techniques" in apps/*/lib/blog.ts. No ALTER TYPE needed.
-- This is the first seed to actually use that value.
--
-- Worth knowing, since 00081 and 00085 both chose TIPS_INSIGHTS for STUDIO
-- posts: categoriesForSection() in apps/marketing/lib/blog.ts restricts the
-- studio blog's filter chips to the six STUDIO_CATEGORIES, and TIPS_INSIGHTS
-- is not one of them. Such a post still renders correctly (CATEGORY_LABELS
-- covers every enum value) but cannot be reached from the category filter on
-- /studiospace/blog. EQUIPMENT_TECHNIQUES is in that list, so this post is
-- filterable.
--
-- Same idempotent-on-slug pattern as 00074–00085: children are deleted and
-- reinserted on re-run, matching the admin form's save behaviour.
--
-- Images: the featured image and the S2 lens-lineup image are left NULL —
-- upload them in the dashboard (Blog → edit). Alt text is stored now so it
-- is in place the moment an image is set. The brief's captions have no
-- column on blog_sections, so they are not stored.
--
-- Cross-links: S3.S3 points at the 00081 lighting post and S3.S4 at
-- /rentals (the equipment add-ons page). 00081 must be applied for that
-- first link to resolve.
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
    'how-to-choose-right-camera-lens',
    'How to Choose the Right Camera Lens for Your Shoot',
    'STUDIO',
    'EQUIPMENT_TECHNIQUES',
    'Photographer choosing a camera lens for a professional photoshoot in Coimbatore.',
    '<p>A camera body is only one part of the photography setup. The lens you choose affects framing, perspective, background appearance and how much of the scene fits into the image.</p>'
    '<p>A lens that works well for portraits may not be the most practical choice for a small product or a wide studio scene. Understanding a few basic differences can help you choose equipment more confidently.</p>'
    '<p>You do not need a large collection of lenses for every project. Start by understanding the purpose of the shoot, the space available and the type of image you want to create.</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Camera Lens Selection',
      'Best Lens for Portraits',
      'Product Photography Lens',
      'Camera Lens Focal Length',
      'Camera Lens Rental Coimbatore',
      'Studio Space Coimbatore'
    ],
    7,
    now(),
    'How to Choose the Right Camera Lens for Your Shoot',
    'Learn how focal length, aperture, camera compatibility and shooting distance help you choose the right lens for photography and video projects.'
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

  -- ── S2 — lens fundamentals (carries the lens-lineup image) ──────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'What Should You Know About Camera Lenses?',
    '<p>Four properties account for most of the difference between one lens and another. Understanding them makes the rest of the decision straightforward.</p>',
    'RICH_TEXT',
    'Camera lenses of different focal lengths arranged for photography equipment selection.',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Understand Focal Length',
   '<p>Focal length, measured in millimetres, influences the angle of view and framing.</p>'
   '<ul>'
   '<li><strong>Wide-angle lenses:</strong> Capture more of the scene and can be useful for interiors, environmental portraits and wider compositions.</li>'
   '<li><strong>Standard lenses:</strong> Offer a versatile field of view for many everyday photography situations.</li>'
   '<li><strong>Telephoto lenses:</strong> Provide a narrower view and can be useful for portraits, distant subjects and tighter framing.</li>'
   '</ul>'
   '<p>The best focal length depends on the subject and how much room you have to work with.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Choose a Lens for the Subject',
   '<p>Different subjects have different requirements.</p>'
   '<p>For portraits, a standard or short telephoto lens can help create flattering framing. For product photography, the choice depends on product size, working distance and whether you need close-up details. For interiors, a wider lens can help capture more of the space.</p>'
   '<p>Avoid choosing a lens only because it is popular. Think about the image you need to produce.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Consider Aperture',
   '<p>A lens''s maximum aperture affects how much light it can transmit and how easily you can create a shallow depth of field.</p>'
   '<p>A wider aperture, such as f/1.8, can be useful in low light and when you want a blurred background. A smaller aperture, such as f/8, can help keep more of a scene in focus, depending on the subject distance and camera setup.</p>'
   '<p>For product photography, you may need more depth of field to show important details clearly. For portraits, a shallow depth of field may suit the intended style.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'Check Camera Compatibility',
   '<p>Not every lens works with every camera body.</p>'
   '<p>Before choosing a lens, confirm the mount, sensor coverage, autofocus compatibility and any relevant stabilisation features. If you are renting equipment, share your camera model with the provider before confirming the lens.</p>',
   'RICH_TEXT', 3);

  -- ── S3 — selecting for a project ────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'How to Select a Lens for Your Project',
    '<p>Once the fundamentals are clear, the choice comes down to the specifics of your shoot — the room, the light and the image you need at the end.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Start With Your Shooting Distance',
   '<p>Consider how far you can stand from the subject. A wide lens can be useful in a small room, but moving too close to a face or product can exaggerate perspective.</p>'
   '<p>A longer lens may require more distance between the camera and subject. Make sure the available studio space supports the framing you need.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Think About the Final Image',
   '<p>Ask yourself what the image should communicate.</p>'
   '<p>Do you need to show the full environment, isolate a person from the background, capture a product''s details or create a close-up? Your answer will help narrow down the lens options.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Match the Lens to the Lighting',
   '<p>If you expect to work in low light, a wider maximum aperture may be helpful. In a controlled studio with suitable lighting, you may have more flexibility to choose a lens based on framing and depth of field.</p>'
   '<p>Lighting and lens selection should work together rather than being treated as separate decisions. You can also explore <a href="/studiospace/blog/how-lighting-changes-quality-of-photoshoot">How Lighting Changes the Quality of a Photoshoot</a> for guidance on planning your lighting.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'Rent Before Investing in More Equipment',
   '<p>If you only need a particular lens for one project, renting can be a practical way to test its suitability before buying.</p>'
   '<p>Studio Space Coimbatore lists camera and lens add-ons on its <a href="/rentals">studio rental page</a>. Check the current equipment list, compatibility and availability before booking.</p>',
   'RICH_TEXT', 3),
  (v_section_id, 'Quick Checklist',
   '<p>Before selecting a lens:</p>'
   '<ul>'
   '<li>Identify the type of shoot.</li>'
   '<li>Decide the required framing.</li>'
   '<li>Measure or estimate the available shooting distance.</li>'
   '<li>Check the maximum aperture you need.</li>'
   '<li>Confirm camera and lens compatibility.</li>'
   '<li>Consider the lighting conditions.</li>'
   '<li>Verify rental availability, if applicable.</li>'
   '</ul>',
   'BULLET_LIST', 4),
  (v_section_id, 'Camera Equipment at Studio Space Coimbatore',
   '<p>Choosing equipment is easier when you begin with the requirements of the shoot. Consider the subject, framing, space, lighting and final image format before selecting a lens.</p>'
   '<p>Studio Space Coimbatore provides a studio environment for photography and video projects, with equipment add-ons listed on its website. Confirm the exact lens model and availability before your session.</p>',
   'RICH_TEXT', 5);

  -- ── S4 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'Which lens is best for beginners?',
   '<p>A standard zoom lens or a versatile standard prime lens can be a useful starting point. The right choice depends on your camera, budget and the types of photographs you take.</p>', 0),
  (v_post_id, 'Which lens is suitable for portraits?',
   '<p>Standard and short telephoto lenses are common portrait choices. The best focal length depends on the desired framing, working distance and visual style.</p>', 1),
  (v_post_id, 'Is a wide-angle lens good for product photography?',
   '<p>It can be useful for products shown within an environment, but close wide-angle framing can distort proportions. For accurate product images, choose a lens and working distance that preserve the product''s appearance.</p>', 2),
  (v_post_id, 'What does aperture mean on a camera lens?',
   '<p>Aperture describes the opening through which light enters the lens. It affects exposure and depth of field, alongside other factors such as focal length and subject distance.</p>', 3),
  (v_post_id, 'Should I rent or buy a camera lens?',
   '<p>Buying may make sense for frequent use. Renting can help when a project requires a specialised lens or when you want to test a lens before investing in it.</p>', 4);

  -- ── S5 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'The Right Lens Is the One That Suits Your Shoot',
    '<p>Plan your framing before choosing equipment, check camera compatibility and test the setup whenever possible.</p>'
    '<p>For photography projects requiring a dedicated workspace, explore Studio Space Coimbatore.</p>'
  ) RETURNING id INTO v_cta_id;

  -- Studio CTA conventions, matching 00081/00085: /studiospace and the STUDIO
  -- WhatsApp number (919025492090). /rentals is included here because the
  -- post is specifically about equipment.
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Explore Studio Space', '/studiospace', 0),
  (v_cta_id, 'View Equipment Add-ons', '/rentals', 1),
  (v_cta_id, 'Check Lens Availability',
   'https://wa.me/919025492090?text=Hi%21%20I%27d%20like%20to%20check%20camera%20lens%20availability%20for%20my%20shoot.', 2);

END $$;

COMMIT;
