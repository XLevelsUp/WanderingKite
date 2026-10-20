-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "Candid vs Traditional Wedding Photography: Which One Do You Need?"
--
-- Photography-section blog post (section = 'PHOTOGRAPHY', category =
-- 'WEDDING_EVENT'). Same idempotent-on-slug pattern as 00069/00071/00072:
-- children are deleted and reinserted on re-run, matching the admin form's
-- save behaviour.
--
-- The featured image and the S1 in-post image are left NULL — upload them in
-- the dashboard (Blog → edit). Alt text is stored ready for when they are set.
--
-- CTA targets match 00072: the wedding/event portfolio lives at
-- /photography/events (PortfolioCategories.tsx — there is no dedicated
-- /photography/wedding slug), and outbound actions use the PHOTOGRAPHY
-- WhatsApp number (siteConfig.contact.whatsapp), distinct from the studio
-- number used in 00069/00071.
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
    'candid-vs-traditional-wedding-photography',
    'Candid vs Traditional Wedding Photography: Which One Do You Need?',
    'PHOTOGRAPHY',
    'WEDDING_EVENT',
    'Candid and traditional wedding photography in Coimbatore',
    '<p>When you look back at your wedding photographs years later, what do you want to remember?</p>'
    '<p>The smile you shared when nobody was watching? Your parents'' reactions during the ceremony? The family photograph everyone gathered for? Or the little moments between the big ones?</p>'
    '<p>This is where the difference between candid and traditional wedding photography becomes important.</p>'
    '<p>Traditional photography focuses on planned portraits, family photographs and important ceremonies. Candid photography focuses on natural expressions, emotions and interactions as they happen.</p>'
    '<p>But choosing one doesn''t always mean leaving the other behind.</p>'
    '<p>For many weddings, combining candid and traditional photography can help create a more complete visual story — one that captures both the important moments and the emotions surrounding them.</p>'
    '<p>So, what exactly is the difference, and which approach fits your wedding?</p>',
    'Wandering Kite Photography Team',
    ARRAY[
      'Candid Wedding Photography',
      'Traditional Wedding Photography',
      'Wedding Photography',
      'Wedding Photographer Coimbatore',
      'Wedding Photography Tips',
      'Coimbatore Wedding',
      'Wandering Kite Photography'
    ],
    8,
    now(),
    'Candid vs Traditional Wedding Photography: Which One Do You Need?',
    'Candid or traditional wedding photography? Understand the difference, what each approach captures, and how combining both can tell your complete wedding story.'
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

  -- ── S2 (carries the in-post image) ──────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'What Is the Difference Between Candid and Traditional Wedding Photography?',
    '<p>Both approaches document your wedding day, but they work in different ways and preserve different kinds of moments.</p>'
    '<p>Understanding what each one does well makes it easier to decide how much of your coverage should go to each.</p>',
    'RICH_TEXT',
    'Candid moments and traditional family portraits from a Coimbatore wedding',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'What Is Candid Wedding Photography?',
   '<p>Candid wedding photography focuses on moments that happen naturally rather than asking everyone to pose.</p>'
   '<p>It could be:</p>'
   '<ul>'
   '<li>A bride laughing with her friends</li>'
   '<li>A parent''s emotional reaction</li>'
   '<li>A couple sharing a quiet moment</li>'
   '<li>Children playing during the reception</li>'
   '<li>Friends laughing between ceremonies</li>'
   '<li>A spontaneous interaction between family members</li>'
   '</ul>'
   '<p>The photographer works around the action, often staying unobtrusive so the moment can unfold naturally.</p>'
   '<p>The goal is to preserve the emotion and atmosphere of the moment rather than creating it for the camera.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'What Is Traditional Wedding Photography?',
   '<p>Traditional wedding photography is more structured.</p>'
   '<p>The photographer usually directs people into specific positions and compositions to create clear, organised photographs.</p>'
   '<p>This is especially useful for:</p>'
   '<ul>'
   '<li>Family portraits</li>'
   '<li>Couple portraits</li>'
   '<li>Group photographs</li>'
   '<li>Important wedding rituals</li>'
   '<li>Formal photographs with relatives</li>'
   '<li>Traditional ceremony documentation</li>'
   '</ul>'
   '<p>These photographs can become important family records because they intentionally bring together the people who shared your wedding day.</p>',
   'BULLET_LIST', 1),
  (v_section_id, 'What Does Candid Photography Capture That Traditional Photography Doesn''t?',
   '<p>A wedding day is full of moments that are not planned.</p>'
   '<p>Someone laughing during a conversation. A father watching his daughter get ready. Friends reacting to the couple. A grandparent smiling during a ceremony.</p>'
   '<p>These moments may last only a few seconds.</p>'
   '<p>Candid photography gives the photographer the opportunity to notice and preserve these interactions as they happen.</p>'
   '<p>It adds movement, emotion and personality to the overall wedding story.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'What Does Traditional Photography Add to Your Wedding Story?',
   '<p>While candid photographs capture spontaneous moments, traditional photography makes sure the important people and formal occasions are documented deliberately.</p>'
   '<p>Think about your wedding album years from now. You may want photographs of:</p>'
   '<ul>'
   '<li>You with your parents</li>'
   '<li>Both families together</li>'
   '<li>The couple with grandparents</li>'
   '<li>Important wedding rituals</li>'
   '<li>Group photographs with close friends</li>'
   '<li>The couple''s formal portraits</li>'
   '</ul>'
   '<p>These are moments that may require direction and coordination. Traditional photography helps make sure they aren''t missed.</p>',
   'BULLET_LIST', 3);

  -- ── S3 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'How to Decide Between Candid and Traditional Wedding Photography',
    '<p>The decision is less about picking a winner and more about understanding which moments you want preserved.</p>'
    '<p>A few practical questions can help you plan your coverage.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Consider the Kind of Memories You Want',
   '<p>Start with a simple question: when you look at your wedding album, what do you want to feel?</p>'
   '<p>If you want photographs filled with spontaneous expressions and natural interactions, candid photography may be important to you.</p>'
   '<p>If family portraits, rituals and formal photographs are equally important, traditional coverage has an important role.</p>'
   '<p>If you want both, you don''t necessarily need to choose only one.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Think About Your Wedding Functions',
   '<p>Different wedding functions can benefit from different photography approaches.</p>'
   '<ul>'
   '<li><strong>Mehendi:</strong> Candid photographs can capture conversations, laughter and interactions among friends and family.</li>'
   '<li><strong>Haldi:</strong> The movement and playful atmosphere can create plenty of natural candid moments.</li>'
   '<li><strong>Wedding Ceremony:</strong> Traditional coverage can help document important rituals, family photographs and formal portraits.</li>'
   '<li><strong>Reception:</strong> A combination can capture both stage photographs and natural interactions with guests.</li>'
   '</ul>'
   '<p>Thinking about each function separately can help you plan your photography coverage.</p>',
   'BULLET_LIST', 1),
  (v_section_id, 'Consider Your Family and Guest Groups',
   '<p>Indian weddings often bring together several generations of family and large groups of relatives.</p>'
   '<p>Some photographs are best planned. If you want photographs with grandparents, parents, siblings, cousins and extended family, tell your photographer beforehand.</p>'
   '<p>A planned family photograph can be difficult to recreate later.</p>'
   '<p>At the same time, your photographer can look for natural interactions between these same people throughout the day. This is where combining both approaches can provide broader coverage.</p>',
   'RICH_TEXT', 2),
  (v_section_id, 'Discuss Your Expectations Before the Wedding',
   '<p>Your photographer cannot know every photograph that matters to you unless you communicate it.</p>'
   '<p>During your consultation, discuss:</p>'
   '<ul>'
   '<li>Your preferred photography style</li>'
   '<li>Important family members</li>'
   '<li>Must-have photographs</li>'
   '<li>Wedding rituals</li>'
   '<li>Function timings</li>'
   '<li>Venue details</li>'
   '<li>Couple portrait preferences</li>'
   '<li>Candid moments you particularly value</li>'
   '</ul>'
   '<p>Wandering Kite''s photography process begins with an initial consultation where clients can discuss their requirements and vision. The team also encourages clients to share Pinterest boards, reference photographs and specific must-have shots so a suitable shot list can be planned.</p>',
   'BULLET_LIST', 3),
  (v_section_id, 'Candid vs Traditional: Quick Checklist',
   '<p>A simple way to compare what each approach brings to your album:</p>'
   '<ul>'
   '<li><strong>Natural expressions</strong> vs <strong>planned compositions</strong></li>'
   '<li><strong>Unposed interactions</strong> vs <strong>directed poses</strong></li>'
   '<li><strong>Emotional moments</strong> vs <strong>formal portraits</strong></li>'
   '<li><strong>Guest interactions</strong> vs <strong>family group photographs</strong></li>'
   '<li><strong>Spontaneous moments</strong> vs <strong>important rituals</strong></li>'
   '<li><strong>Documentary feel</strong> vs <strong>structured coverage</strong></li>'
   '</ul>'
   '<p>The important question isn''t always "Which one is better?" It is: "Which moments do you want your wedding photographs to preserve?"</p>',
   'BULLET_LIST', 4),
  (v_section_id, 'Why Wandering Kite Offers Both',
   '<p>Wandering Kite provides Candid &amp; Traditional wedding photography as a combined service, designed to cover both natural moments and formal portraits.</p>'
   '<p>The approach is built around authentic storytelling, with the photographer working unobtrusively to capture genuine moments while also covering the structured photographs that are important to the couple and their families.</p>'
   '<p>The wedding photography process includes consultation, booking, shooting, post-production and delivery. Professionally edited high-resolution images are delivered through a cloud link within 7–10 days.</p>'
   '<p>For couples planning a wedding in Coimbatore, this combination can help create an album that includes both the moments you planned and the moments you didn''t know were happening.</p>',
   'RICH_TEXT', 5);

  -- ── S4 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Three Things to Discuss With Your Wedding Photographer',
    '<p>A short conversation before the wedding can shape the entire album.</p>'
    '<p>These three points are worth raising in your consultation.</p>',
    'RICH_TEXT', 2
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Tell Them What Matters Most',
   '<p>Every couple has different priorities.</p>'
   '<p>For some, family photographs are essential. For others, the focus may be on emotions, couple portraits, details or guest interactions.</p>'
   '<p>Tell your photographer which moments matter most to you.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'Share Your Must-Have Shots',
   '<p>Create a simple list of photographs you don''t want to miss. For example:</p>'
   '<ul>'
   '<li>Couple with parents</li>'
   '<li>Couple with grandparents</li>'
   '<li>Complete family photograph</li>'
   '<li>Close friends</li>'
   '<li>Important rituals</li>'
   '<li>Couple portraits</li>'
   '<li>Special details</li>'
   '<li>Candid family moments</li>'
   '</ul>'
   '<p>A short list can help your photographer plan the coverage around your priorities.</p>',
   'BULLET_LIST', 1),
  (v_section_id, 'Leave Room for the Unexpected',
   '<p>A wedding cannot be completely scripted.</p>'
   '<p>Some of the photographs you treasure most may happen without warning.</p>'
   '<p>Give your photographer enough freedom to observe what is happening around you.</p>'
   '<p>The planned photographs document the people and rituals you know you want. The candid photographs can preserve the moments you didn''t expect. Together, they can tell a fuller story.</p>',
   'RICH_TEXT', 2);

  -- ── S5 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Which Photography Style Do You Need?',
    '<p>There is no single correct answer — only the one that matches the story you want to keep.</p>',
    'RICH_TEXT', 3
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'If You Love Natural Moments',
   '<p>Candid photography may be an important part of your wedding coverage if you want your photographs to focus on natural expressions, emotions and interactions.</p>',
   'RICH_TEXT', 0),
  (v_section_id, 'If Family Portraits Are Important',
   '<p>Traditional photography can help ensure your closest family members and important groups are intentionally photographed together.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'If You Want a Complete Wedding Story',
   '<p>Consider combining both.</p>'
   '<p>Candid photography can capture the atmosphere and emotions surrounding your wedding, while traditional photography can document the people, rituals and formal moments that you deliberately want to preserve.</p>'
   '<p>Your wedding doesn''t have to fit into one photography style.</p>',
   'RICH_TEXT', 2);

  -- ── S6 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'Carrying the Story Beyond the Wedding Day',
    '<p>Your wedding photographs aren''t simply a collection of poses.</p>'
    '<p>They become a visual record of the people who were there, the traditions you celebrated and the emotions you experienced.</p>'
    '<p>That is why the conversation about candid versus traditional photography should begin with your story rather than a checklist of trends.</p>'
    '<p>At Wandering Kite, the focus is on authentic storytelling across weddings and events, combining candid moments with traditional coverage according to the requirements of the celebration.</p>'
    '<p>Because years from now, you may not remember every photograph that was taken. But you will remember how certain photographs made you feel.</p>',
    'RICH_TEXT', 4
  );

  -- ── S7 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'What is the difference between candid and traditional wedding photography?',
   '<p>Candid photography focuses on natural, spontaneous moments, while traditional photography generally involves planned poses, formal portraits and structured coverage of important rituals.</p>', 0),
  (v_post_id, 'Can I have both candid and traditional photography?',
   '<p>Yes. A wedding photography plan can include both approaches. Wandering Kite offers a combined Candid &amp; Traditional service for wedding coverage.</p>', 1),
  (v_post_id, 'Is candid photography suitable for wedding ceremonies?',
   '<p>Yes. Candid photography can document natural expressions and interactions during ceremonies. However, traditional coverage can also be useful for ensuring important rituals and formal family photographs are deliberately documented.</p>', 2),
  (v_post_id, 'Do I need to provide a shot list?',
   '<p>It can be helpful, particularly for important family photographs or specific moments you want captured. Wandering Kite allows clients to share reference photographs, Pinterest boards and must-have shots during consultation.</p>', 3),
  (v_post_id, 'How many edited wedding photographs will I receive?',
   '<p>Wandering Kite states that wedding packages generally include 500–800 professionally edited photographs, depending on the selected package.</p>', 4);

  -- ── S8 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Candid or Traditional? Maybe Your Wedding Story Needs Both.',
    '<p>Your wedding has planned moments. And then there are the moments you never planned.</p>'
    '<p>The laughter between ceremonies. The look your parents share. The hug from a friend. The family photograph everyone waited for. The quiet moment between you and your partner.</p>'
    '<p>Planning your wedding in Coimbatore? Talk to Wandering Kite about your functions, photography style and must-have moments.</p>'
  ) RETURNING id INTO v_cta_id;

  -- Targets mirror 00072: /photography/events is the live wedding/event
  -- portfolio route, and WhatsApp links use the photography number with
  -- lib/whatsapp.ts's own default copy for service: 'photography'.
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'View Wedding Photography', '/photography/events', 0),
  (v_cta_id, 'Discuss Your Wedding',
   'https://wa.me/917010092090?text=Hi%21%20I''m%20interested%20in%20booking%20a%20photography%20session.', 1),
  (v_cta_id, 'Get a Custom Quote',
   'https://wa.me/917010092090?text=Hi%21%20I''d%20like%20a%20custom%20quote%20for%20wedding%20photography.', 2);

END $$;

COMMIT;
