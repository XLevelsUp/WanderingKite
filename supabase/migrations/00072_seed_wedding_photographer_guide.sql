-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "How to Choose the Right Wedding Photographer in Coimbatore" post.
--
-- Photography-section blog post (section = 'PHOTOGRAPHY', category =
-- 'WEDDING_EVENT'). Same idempotent-on-slug pattern as 00069/00071:
-- children deleted and reinserted on re-run, matching the admin form's save.
--
-- The featured image and the S2 in-post image are left NULL — upload them
-- in the dashboard (Blog → edit). Alt text is stored ready for when they
-- are set.
--
-- CTA targets verified against live routes/config: the wedding portfolio
-- lives at /photography/events (PortfolioCategories.tsx — there is no
-- dedicated /photography/wedding slug), and outbound "talk to us" /
-- "get a quote" actions go through WhatsApp using the PHOTOGRAPHY number
-- (siteConfig.contact.whatsapp, distinct from the studio's WhatsApp
-- number used in 00069/00071), matching lib/whatsapp.ts's own default
-- message for service: 'photography'.
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
    'how-to-choose-wedding-photographer-coimbatore',
    'How to Choose the Right Wedding Photographer in Coimbatore',
    'PHOTOGRAPHY',
    'WEDDING_EVENT',
    'Wedding photographer in Coimbatore capturing a candid wedding moment',
    '<p>Your wedding day may last for a few hours, but the photographs will help you remember those moments for years.</p>'
    '<p>Choosing the right wedding photographer in Coimbatore is therefore about more than comparing prices or looking at a few attractive photographs. The photographer''s style, experience, communication, and approach can all influence how your wedding story is captured.</p>'
    '<p>From engagement ceremonies and wedding rituals to candid family moments and reception celebrations, every function has its own atmosphere and important moments.</p>'
    '<p>In this guide, we''ll look at what couples should consider before choosing a wedding photographer, from photography style and portfolio quality to planning, communication, packages, and delivery.</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Wedding Photographer Coimbatore',
      'Wedding Photography',
      'Candid Wedding Photography',
      'Traditional Wedding Photography',
      'Wedding Photography Tips',
      'Coimbatore Wedding',
      'Wandering Kite Photography'
    ],
    7,
    now(),
    'How to Choose the Right Wedding Photographer in Coimbatore',
    'A practical guide to choosing a wedding photographer in Coimbatore — photography style, portfolio, packages, process, and what to ask before you book.'
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
    'What Should You Look For in a Wedding Photographer?',
    '<p>Choosing a wedding photographer should begin with understanding what you want your photographs to feel like.</p>'
    '<p>A photographer may have excellent technical skills, but their visual style should also match your expectations.</p>',
    'RICH_TEXT',
    'Candid and traditional wedding photography in Coimbatore',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Start With Their Photography Style',
   '<p>Wedding photography can include different approaches.</p>'
   '<p>Some photographers focus primarily on candid photography, while others specialise in traditional portraits. Many couples prefer a combination of both.</p>'
   '<p>Candid photography focuses on genuine expressions, interactions, emotions, and moments as they naturally happen.</p>'
   '<p>Traditional photography, meanwhile, is useful for important family portraits, rituals, group photographs, and planned compositions.</p>'
   '<p>The right choice depends on how you want your wedding story to be remembered.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Look at the Complete Portfolio',
   '<p>Don''t choose a photographer based on one or two photographs posted on social media.</p>'
   '<p>Ask to see a complete wedding gallery. Look for:</p>'
   '<ul>'
   '<li>Different wedding functions</li>'
   '<li>Couple portraits</li>'
   '<li>Family photographs</li>'
   '<li>Candid moments</li>'
   '<li>Traditional photographs</li>'
   '<li>Indoor and outdoor images</li>'
   '<li>Different lighting conditions</li>'
   '<li>Reception and ceremony coverage</li>'
   '</ul>'
   '<p>A complete portfolio can give you a better understanding of how the photographer handles an entire wedding rather than a few selected images.</p>',
   'BULLET_LIST', 1),
  (v_section_id, 'Consider Their Experience With Different Functions',
   '<p>A wedding is rarely a single event.</p>'
   '<p>Depending on your celebration, you may have an engagement, pre-wedding session, mehendi, haldi, wedding ceremony, reception, or other family functions.</p>'
   '<p>Each function can require a different photography approach.</p>'
   '<p>For example, a ceremony may require attention to important rituals, while a reception may involve more candid interactions, speeches, couple portraits, and family photographs.</p>'
   '<p>Wandering Kite currently offers wedding and event photography covering engagements, pre-weddings, birthdays, and family celebrations, along with candid and traditional photography.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'Think About Your Location and Venue',
   '<p>The venue can influence the photography plan.</p>'
   '<p>A large outdoor wedding may offer natural light and more space for creative compositions. An indoor venue may require a different lighting approach.</p>'
   '<p>Before booking, discuss:</p>'
   '<ul>'
   '<li>Wedding venue</li>'
   '<li>Number of functions</li>'
   '<li>Indoor and outdoor locations</li>'
   '<li>Expected guest count</li>'
   '<li>Wedding schedule</li>'
   '<li>Important rituals</li>'
   '<li>Photography requirements</li>'
   '</ul>'
   '<p>This allows your photographer to understand the complete scope of the celebration.</p>',
   'BULLET_LIST', 3);

  -- ── S3 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'How to Choose the Right Wedding Photographer',
    '<p>Choosing a wedding photographer should involve more than comparing portfolios.</p>'
    '<p>The photographer should understand your expectations and have a clear process for handling your wedding day.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Discuss Your Photography Requirements',
   '<p>Before booking, explain what you expect from the photography team.</p>'
   '<p>Share your wedding date, locations, functions, preferred photography style, and any important moments you want captured.</p>'
   '<p>You can also share Pinterest boards, reference photographs, or specific must-have shots.</p>'
   '<p>Wandering Kite recommends sharing Pinterest boards, reference photographs, and must-have shots during the consultation so a suitable shot list can be created.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Understand What the Package Includes',
   '<p>Photography packages can differ significantly.</p>'
   '<p>Before making a decision, check:</p>'
   '<ul>'
   '<li>Number of photographers</li>'
   '<li>Hours of coverage</li>'
   '<li>Number of functions</li>'
   '<li>Candid photography</li>'
   '<li>Traditional photography</li>'
   '<li>Number of edited photographs</li>'
   '<li>Delivery format</li>'
   '<li>Album or additional services, if applicable</li>'
   '</ul>'
   '<p>Instead of comparing only the price, compare what you are actually receiving.</p>',
   'BULLET_LIST', 1),
  (v_section_id, 'Check the Photographer''s Process',
   '<p>A professional photography experience should have a clear process from enquiry to final delivery.</p>'
   '<p>Wandering Kite''s current process includes:</p>'
   '<p><strong>Initial Consultation → Booking Confirmation → The Shoot → Post Production → Delivery</strong></p>'
   '<p>A 30% advance secures the date, and professionally edited high-resolution images are generally delivered within 7–10 days.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'Choose Someone You Feel Comfortable With',
   '<p>Your wedding photographer will be present during some of your most personal moments.</p>'
   '<p>Communication and comfort therefore matter.</p>'
   '<p>During your consultation, consider whether the photographer listens to your ideas, answers your questions clearly, and understands the kind of wedding experience you want.</p>'
   '<p>When you feel comfortable, natural expressions and genuine moments are easier to capture.</p>',
   'RICH_TEXT', 3),
  (v_section_id, 'Wedding Photographer Checklist',
   '<p>Before booking your photographer, consider the following:</p>'
   '<ul>'
   '<li>Review their complete wedding portfolio</li>'
   '<li>Decide which photography style you prefer</li>'
   '<li>Discuss all wedding functions</li>'
   '<li>Share your must-have photographs</li>'
   '<li>Confirm the number of photographers</li>'
   '<li>Understand the package inclusions</li>'
   '<li>Check the delivery timeline</li>'
   '<li>Discuss venue and location requirements</li>'
   '<li>Make sure you feel comfortable with the team</li>'
   '</ul>',
   'BULLET_LIST', 4),
  (v_section_id, 'Wandering Kite Wedding Photography',
   '<p>Wandering Kite Photography provides wedding photography from its RS Puram, Coimbatore location and serves clients across Coimbatore, Tiruppur, Salem, and Erode. The team also covers destination weddings and events across India.</p>'
   '<p>The approach combines candid moments and traditional portraits to create complete wedding coverage, while professional post-production focuses on natural colour correction, subtle retouching, and preserving the authentic mood of the moment.</p>'
   '<p>For couples planning their wedding photography, the focus should be on finding a photographer whose style and approach match the story they want to remember.</p>',
   'RICH_TEXT', 5);

  -- ── S4 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'How early should I book a wedding photographer in Coimbatore?',
   '<p>Wandering Kite recommends booking wedding and event photography at least 30 days in advance. Popular wedding dates may require earlier planning depending on availability.</p>', 0),
  (v_post_id, 'Should I choose candid or traditional wedding photography?',
   '<p>You don''t necessarily have to choose one. Combining candid and traditional photography can provide natural emotional moments as well as important family and ritual photographs.</p>', 1),
  (v_post_id, 'Can I share reference photographs with my wedding photographer?',
   '<p>Yes. Sharing Pinterest boards, reference images, and must-have shots can help your photographer understand your expectations and prepare a suitable shot list.</p>', 2),
  (v_post_id, 'Does Wandering Kite cover destination weddings?',
   '<p>Yes. Wandering Kite covers destination weddings and events across India. Travel and accommodation costs are additional and included in the custom quote.</p>', 3),
  (v_post_id, 'How many edited wedding photographs will I receive?',
   '<p>Wedding packages typically include approximately 500–800 professionally edited photographs, depending on the package.</p>', 4);

  -- ── S5 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Ready to Plan Your Wedding Photography?',
    '<p>Choosing the right photographer is an important part of preserving your wedding story.</p>'
    '<p>Whether you are planning an engagement, wedding ceremony, reception, or multiple functions, start by discussing your dates, locations, photography style, and must-have moments.</p>'
    '<p>Explore Wandering Kite''s wedding photography work and speak with the team about your requirements.</p>'
  ) RETURNING id INTO v_cta_id;

  -- /photography/events is the live wedding/event portfolio route (see
  -- PortfolioCategories.tsx — id: 'events', focus: 'Weddings, Engagements &
  -- Birthdays'; there is no separate /photography/wedding slug). WhatsApp
  -- messages use the photography number and mirror lib/whatsapp.ts's own
  -- default copy for service: 'photography', plus a quote-specific variant.
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'View Wedding Photography', '/photography/events', 0),
  (v_cta_id, 'Discuss Your Wedding',
   'https://wa.me/917010092090?text=Hi%21%20I''m%20interested%20in%20booking%20a%20photography%20session.', 1),
  (v_cta_id, 'Get a Custom Quote',
   'https://wa.me/917010092090?text=Hi%21%20I''d%20like%20a%20custom%20quote%20for%20wedding%20photography.', 2);

END $$;

COMMIT;
