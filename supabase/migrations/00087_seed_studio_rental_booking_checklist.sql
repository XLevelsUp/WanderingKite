-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "Studio Rental in Coimbatore: What to Check Before You Book"
--
-- STUDIO-section blog post (section = 'STUDIO', category = 'STUDIO_SPACE').
-- Like 00085/00086 this is a Studio Space post: it renders under
-- /studiospace/blog and uses the STUDIO WhatsApp number
-- (siteConfig.contact.studioWhatsapp, 919025492090), NOT the photography
-- number used in 00082–00084.
--
-- CATEGORY: the brief says "Studio Space", which maps exactly to
-- STUDIO_SPACE (added by 00068, labelled "Studio Space" in apps/*/lib/blog.ts
-- and present in STUDIO_CATEGORIES, so the post is reachable from the
-- category filter on /studiospace/blog). No ALTER TYPE needed.
--
-- NOT a duplicate of 00071: that post ("how-to-choose-studio-space-in-
-- coimbatore") is about selecting a studio; this one is the pre-booking
-- checklist — what to verify once you have one in mind. Different slug,
-- different angle, same category.
--
-- Same idempotent-on-slug pattern as 00074–00086: children are deleted and
-- reinserted on re-run, matching the admin form's save behaviour.
--
-- Images: the featured image and the S2 studio-interior image are left NULL
-- — upload them in the dashboard (Blog → edit). Alt text is stored now so it
-- is in place the moment an image is set. The brief's captions have no
-- column on blog_sections, so they are not stored.
--
-- Cross-links: S3.S6 points at /studiospace (the rental page) and
-- /studiospace/blog (the listing). Both routes exist today — no dependency
-- on an unapplied migration, unlike 00085/00086 which link to 00081.
--
-- CLAIMS CHECK: the brief's "1,200 sq. ft." and "infinity wall" match what
-- /studiospace already states on the live page, so they are reproduced as
-- given. The S4Q2 answer attributes the bring-your-own-equipment permission
-- to the studio's published FAQ rather than asserting it directly, as the
-- brief does.
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
    'studio-rental-coimbatore-booking-checklist',
    'Studio Rental in Coimbatore: What to Check Before You Book',
    'STUDIO',
    'STUDIO_SPACE',
    'Photography studio rental in Coimbatore with lighting equipment and a prepared shooting area.',
    '<p>Choosing a studio is about more than finding an attractive background. The space needs to support your shooting requirements, equipment, team size and production schedule.</p>'
    '<p>A portrait session may need a simple backdrop and controlled lighting. A product shoot may require room for equipment and several product arrangements. A video production may need additional space for cameras, crew and repeated setups.</p>'
    '<p>If you are looking for a studio rental in Coimbatore, reviewing a few practical details before booking can help you choose a space that suits the project.</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Studio Rental in Coimbatore',
      'Photography Studio Rental Coimbatore',
      'Studio Space for Rent',
      'Photoshoot Studio Coimbatore',
      'Professional Studio Facilities',
      'Studio Space Coimbatore'
    ],
    7,
    now(),
    'Studio Rental in Coimbatore: Booking Checklist',
    'Looking for a studio rental in Coimbatore? Check the space, lighting, backdrops, equipment, facilities and booking terms before you book.'
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

  -- ── S2 — what to check (carries the studio-interior image) ──────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'What Should You Check Before Booking a Studio?',
    '<p>Four things determine whether a studio will actually work for your shoot. Each is worth confirming before you pay a deposit.</p>',
    'RICH_TEXT',
    'Interior of a professional studio space prepared for a photoshoot in Coimbatore.',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Check the Size and Layout',
   '<p>Start with the shooting area rather than the total floor area alone.</p>'
   '<p>Consider the distance between the subject and camera, the space required for lighting stands, and whether the team can move around safely. Ceiling height can also affect overhead lighting and larger setups.</p>'
   '<p>Ask whether the studio layout can accommodate the number of people and equipment involved in your shoot.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Review the Lighting and Backdrops',
   '<p>Find out which lights, stands, modifiers and backgrounds are included in the rental.</p>'
   '<p>Ask whether the studio has the type of lighting you need, such as continuous lights for video or flash lighting for still photography. Check the available backdrop colours and whether a seamless background or infinity wall is suitable for your project.</p>'
   '<p>Do not assume every item shown in a photograph is included in the booking. Confirm what is available and whether additional equipment carries a separate charge.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Check Equipment Availability',
   '<p>Prepare a list of the camera, lenses, microphones, lighting and accessories you need.</p>'
   '<p>If you plan to rent equipment at the studio, confirm the exact models, compatibility and availability for your date. If you are bringing your own gear, check whether there is enough room to arrange it comfortably.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'Review the Facilities',
   '<p>Depending on your shoot, useful facilities may include:</p>'
   '<ul>'
   '<li>Air-conditioned shooting space.</li>'
   '<li>Changing or makeup room.</li>'
   '<li>Wi-Fi.</li>'
   '<li>Power backup.</li>'
   '<li>Accessible parking or nearby parking options.</li>'
   '<li>A suitable waiting area for guests or clients.</li>'
   '</ul>'
   '<p>Prioritise the facilities your project genuinely needs rather than choosing based only on the number of amenities listed.</p>',
   'BULLET_LIST', 3);

  -- ── S3 — choosing the right studio ──────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'How to Choose the Right Studio for Your Project',
    '<p>Once you know what to check, the remaining decisions are about fit — matching the space, the schedule and the terms to the production you are planning.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Match the Studio to the Type of Shoot',
   '<p>Different projects require different setups.</p>'
   '<p>Portraits may need a flexible backdrop and flattering lighting. Product photography may need careful reflection control and repeatable camera positions. Interviews and talking-head videos may require microphones, controlled sound conditions and room for multiple camera angles.</p>'
   '<p>Write down the key requirements before comparing studios.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Understand the Booking Duration',
   '<p>Estimate the time needed for setup, testing, shooting and packing equipment away.</p>'
   '<p>A short portrait session may need less time than a production involving multiple backgrounds, several people or repeated lighting changes. Allow time for retakes instead of planning every minute around recording.</p>'
   '<p>Review the available booking options and confirm the exact start and end times, including any setup or wrap-up requirements.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Ask About the Full Booking Terms',
   '<p>Before confirming, clarify:</p>'
   '<ul>'
   '<li>What is included in the rental.</li>'
   '<li>Which equipment costs extra.</li>'
   '<li>Whether a deposit is required.</li>'
   '<li>Payment and cancellation terms.</li>'
   '<li>Rescheduling conditions.</li>'
   '<li>Access and overtime rules.</li>'
   '</ul>'
   '<p>Clear booking terms help the team plan realistically and reduce misunderstandings on the shoot day.</p>',
   'BULLET_LIST', 2),
  (v_section_id, 'Consider the Location and Workflow',
   '<p>Think about how your team, talent and equipment will reach the studio. Consider travel time, parking, loading equipment and nearby facilities.</p>'
   '<p>For projects involving clients or guests, share the location and arrival instructions in advance. Plan who will bring equipment, who will manage the setup and who will check the final shot list.</p>',
   'RICH_TEXT', 3),
  (v_section_id, 'Quick Checklist',
   '<p>Before booking a studio, confirm:</p>'
   '<ul>'
   '<li>The shooting area suits your setup.</li>'
   '<li>Lighting and backdrops meet your needs.</li>'
   '<li>Required equipment is available.</li>'
   '<li>Facilities suit your team and project.</li>'
   '<li>Booking duration allows setup and wrap-up.</li>'
   '<li>Price, deposit and cancellation terms are clear.</li>'
   '<li>Location and arrival arrangements are practical.</li>'
   '</ul>',
   'BULLET_LIST', 4),
  (v_section_id, 'Studio Rental at Studio Space Coimbatore',
   '<p>Studio Space Coimbatore is located in RS Puram and lists a 1,200 sq. ft. studio, an infinity wall, multiple backdrops, professional lighting facilities and optional equipment add-ons on its <a href="/studiospace">studio rental page</a>.</p>'
   '<p>Review the facilities and confirm what is included for your chosen booking. If your project includes video interviews or podcast recording, check the requirements for the specific setup rather than assuming every configuration is identical.</p>'
   '<p>You can also browse the <a href="/studiospace/blog">Studio Space blog</a> for practical guides on photography, video production, content creation, podcasting and equipment.</p>',
   'RICH_TEXT', 5);

  -- ── S4 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'What should I look for when renting a photography studio?',
   '<p>Check the shooting area, lighting, backdrops, equipment, facilities, booking duration and rental terms. Match these details to your specific project.</p>', 0),
  (v_post_id, 'Can I bring my own camera and equipment?',
   '<p>The studio''s published FAQ says clients can bring their own cameras, lenses and lighting. Confirm any specific setup requirements with the studio before your booking.</p>', 1),
  (v_post_id, 'Should I book a studio by the hour or for a longer session?',
   '<p>Choose a duration that allows enough time for setup, testing, shooting and packing. Projects involving several setups or multiple deliverables may require a longer session.</p>', 2),
  (v_post_id, 'Is the same studio suitable for photography and video?',
   '<p>Some studios support both, but the suitability depends on lighting, sound conditions, ceiling height, available space and equipment. Check that the facilities meet your production requirements.</p>', 3),
  (v_post_id, 'What should I confirm before paying a booking deposit?',
   '<p>Confirm the date, time, total charges, included equipment, deposit requirements, cancellation policy and any overtime fees. Keep the booking details for reference.</p>', 4);

  -- ── S5 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'A Good Session Starts With the Right Space',
    '<p>Prepare your requirements, confirm the facilities and allow enough time for your production.</p>'
    '<p>To review the facilities and booking options, visit Studio Space Coimbatore.</p>'
  ) RETURNING id INTO v_cta_id;

  -- Studio CTA conventions, matching 00081/00085/00086.
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Explore Studio Space', '/studiospace', 0),
  (v_cta_id, 'Check Availability',
   'https://wa.me/919025492090?text=Hi%21%20I%20want%20to%20check%20studio%20availability%20for%20my%20shoot.', 1),
  (v_cta_id, 'Ask About Booking Terms',
   'https://wa.me/919025492090?text=Hi%21%20I%27d%20like%20to%20know%20what%27s%20included%20in%20a%20studio%20booking.', 2);

END $$;

COMMIT;
