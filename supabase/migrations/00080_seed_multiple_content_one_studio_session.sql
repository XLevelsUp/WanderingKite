-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "How to Create Multiple Pieces of Content From One Studio Session".
--
-- Fifth studiospace blog post (after 00069's launch post, 00071's studio
-- selection guide, 00075's podcast recording guide and 00079's studio-vs-
-- location guide). section = 'STUDIO' so it renders on /studiospace, not the
-- photography blog. Same idempotent-on-slug pattern: children deleted and
-- reinserted on re-run.
--
-- Category note: the brief asked for "Content Creation", but "BlogCategory"
-- (00066) only allows WEDDING_EVENT / PORTRAITS_LIFESTYLE / COMMERCIAL_BRAND /
-- TIPS_INSIGHTS. TIPS_INSIGHTS is used here — this is a planning guide, and
-- it matches 00071/00075/00079's studio guides.
--
-- published_at is now(); set an explicit timestamp to back-date or stage.
--
-- The featured image and the S2 in-post image are left NULL — upload them in
-- the dashboard (Blog → edit). Alt text is stored ready for when they are set.
--
-- CTA/link targets: /studiospace is the studio booking page. WhatsApp uses
-- the STUDIO number (siteConfig.contact.studioWhatsapp = 919025492090),
-- matching 00069/00071/00075/00079 — not the photography number.
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
    'create-multiple-content-from-one-studio-session',
    'How to Create Multiple Pieces of Content From One Studio Session',
    'STUDIO',
    'TIPS_INSIGHTS',
    'Content creator producing multiple pieces of content in a studio',
    '<p>Creating content consistently can become difficult when every post requires a completely separate shoot.</p>'
    '<p>One practical approach is to plan a studio session around multiple pieces of content.</p>'
    '<p>Instead of recording one video and leaving, creators and businesses can prepare several topics, formats, and variations in advance.</p>'
    '<p>A single session could produce a long-form video, several short clips, photographs, product shots, behind-the-scenes content, and social media posts.</p>'
    '<p>The key is planning the content before entering the studio.</p>',
    'Studio Space Coimbatore Team',
    ARRAY[
      'Content Creation Studio Coimbatore',
      'Content Creation Studio',
      'Content Studio Coimbatore',
      'Social Media Content Studio',
      'Content Production',
      'Studio for Content Creators',
      'Studio Space Coimbatore'
    ],
    7,
    now(),
    'Create More Content From One Studio Session | Studio Space Coimbatore',
    'Learn how to plan one studio session for long-form videos, reels, photography, behind-the-scenes content, and multiple social media assets.'
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

  -- ── S2 (carries the in-post image: creator reviewing footage) ───────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'What Can You Create From One Studio Session?',
    '<p>A studio session does not have to produce only one final asset.</p>',
    'RICH_TEXT',
    'Creator producing multiple content formats during a studio session',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Long-Form Video',
   '<p>Start with your main piece of content.</p>'
   '<p>Depending on your purpose, this could be:</p>'
   '<ul>'
   '<li>YouTube video</li>'
   '<li>Interview</li>'
   '<li>Educational video</li>'
   '<li>Business presentation</li>'
   '<li>Product demonstration</li>'
   '<li>Podcast video</li>'
   '</ul>'
   '<p>This becomes the primary recording from which additional content can be developed.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Short-Form Video',
   '<p>Long-form recordings often contain smaller sections that can work independently.</p>'
   '<p>Useful short-form content can include:</p>'
   '<ul>'
   '<li>Tips</li>'
   '<li>Answers to common questions</li>'
   '<li>Short explanations</li>'
   '<li>Strong statements</li>'
   '<li>Educational clips</li>'
   '<li>Behind-the-scenes moments</li>'
   '</ul>'
   '<p>Planning your main recording with these smaller pieces in mind can make repurposing easier.</p>',
   'BULLET_LIST', 1),
  (v_section_id, 'Photographs',
   '<p>While the video setup is ready, consider capturing photographs as well.</p>'
   '<p>Depending on the project, these can include:</p>'
   '<ul>'
   '<li>Portraits</li>'
   '<li>Product photographs</li>'
   '<li>Team photographs</li>'
   '<li>Profile images</li>'
   '<li>Social media images</li>'
   '<li>Promotional photographs</li>'
   '</ul>'
   '<p>This can provide additional visual content without requiring another full production session.</p>',
   'BULLET_LIST', 2),
  (v_section_id, 'Behind-the-Scenes Content',
   '<p>People are often interested in how content is created.</p>'
   '<p>During the shoot, capture:</p>'
   '<ul>'
   '<li>Setup moments</li>'
   '<li>Camera preparation</li>'
   '<li>Lighting setup</li>'
   '<li>Team interactions</li>'
   '<li>Short clips between takes</li>'
   '<li>Final production environment</li>'
   '</ul>'
   '<p>These can become social media stories, reels, or behind-the-scenes posts.</p>',
   'BULLET_LIST', 3);

  -- ── S3 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'How to Plan a Multi-Content Studio Session',
    '<p>Most of the work happens before the session starts.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Create a Content List First',
   '<p>Before booking the studio, list everything you want to produce. For example:</p>'
   '<ul>'
   '<li><strong>Main Content</strong> — 1 long-form video</li>'
   '<li><strong>Short Content</strong> — 5–10 short clips</li>'
   '<li><strong>Photography</strong> — portraits, product or brand images</li>'
   '<li><strong>Behind the Scenes</strong> — setup photos, short video clips</li>'
   '</ul>'
   '<p>Having a list helps you understand how much time the session requires.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Group Similar Content Together',
   '<p>Avoid constantly changing the setup.</p>'
   '<p>If several videos can use the same camera angle, background, and lighting arrangement, record them together. Then move to the next setup.</p>'
   '<p>This can reduce unnecessary changes and make the session more organised.</p>',
   'RICH_TEXT', 1),
  (v_section_id, 'Prepare Your Script or Talking Points',
   '<p>For each video, prepare the essential information beforehand.</p>'
   '<p>You do not necessarily need a word-for-word script. A list of:</p>'
   '<ul>'
   '<li>Hooks</li>'
   '<li>Main points</li>'
   '<li>Examples</li>'
   '<li>Questions</li>'
   '<li>Closing statements</li>'
   '</ul>'
   '<p>can be enough for conversational content.</p>',
   'BULLET_LIST', 2),
  (v_section_id, 'Plan Your Content Repurposing',
   '<p>Think about where each piece of content will be used.</p>'
   '<p>A single recording might become:</p>'
   '<ul>'
   '<li><strong>YouTube</strong> — full video</li>'
   '<li><strong>Instagram</strong> — short clips</li>'
   '<li><strong>LinkedIn</strong> — educational excerpts</li>'
   '<li><strong>Stories</strong> — behind-the-scenes content</li>'
   '<li><strong>Website</strong> — supporting video or photographs</li>'
   '</ul>'
   '<p>This makes the production session part of a broader content strategy.</p>',
   'BULLET_LIST', 3),
  (v_section_id, 'Quick Checklist',
   '<p>Before your studio session:</p>'
   '<ul>'
   '<li>Prepare the content list</li>'
   '<li>Decide the priority content</li>'
   '<li>Prepare scripts or talking points</li>'
   '<li>Group similar setups</li>'
   '<li>Plan photography requirements</li>'
   '<li>Plan short-form content</li>'
   '<li>Capture behind-the-scenes material</li>'
   '<li>Keep extra time for retakes</li>'
   '</ul>',
   'BULLET_LIST', 4),
  (v_section_id, 'Content Creation at Studio Space Coimbatore',
   '<p><a href="/studiospace">Studio Space Coimbatore</a> can provide a practical environment for creators and businesses producing different types of visual content.</p>'
   '<p>A controlled studio setup can make it easier to move between video, photography, interviews, product content, and other planned formats during one session.</p>'
   '<p>The important part is to arrive with a clear production plan. When the content list, shooting order, and setup requirements are decided beforehand, studio time can be used more efficiently.</p>',
   'RICH_TEXT', 5);

  -- ── S4 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'How much content can one studio session produce?',
   '<p>There is no fixed number. It depends on the number of setups, people involved, content complexity, and available recording time.</p>', 0),
  (v_post_id, 'Can I record reels and long-form videos on the same day?',
   '<p>Yes. Planning the shooting order and grouping similar setups can make it practical to produce both during one session.</p>', 1),
  (v_post_id, 'Should I record photographs during a video shoot?',
   '<p>If the lighting and setup are suitable, capturing photographs during the same session can provide additional content without requiring another shoot.</p>', 2),
  (v_post_id, 'How do I avoid wasting studio time?',
   '<p>Prepare your content list, scripts, equipment requirements, shooting order, and setup changes before the session.</p>', 3),
  (v_post_id, 'Is this approach useful for businesses?',
   '<p>Yes. Businesses can use one organised session to create educational videos, team content, product content, social media clips, and other visual assets.</p>', 4);

  -- ── S5 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Planning a Content Shoot?',
    '<p>A productive studio session starts before you enter the studio.</p>'
    '<p>Plan the content, group similar setups, prepare your talking points, and decide how the final material will be used.</p>'
    '<p>With the right preparation, one recording session can become the foundation for a much larger content library.</p>'
  ) RETURNING id INTO v_cta_id;

  -- /studiospace is the studio booking page. WhatsApp uses the STUDIO number
  -- (919025492090), matching 00069/00071/00075/00079.
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Explore Studio Space', '/studiospace', 0),
  (v_cta_id, 'Plan Your Content Session',
   'https://wa.me/919025492090?text=Hi%21%20I%27d%20like%20to%20plan%20a%20content%20shoot%20at%20the%20studio.', 1),
  (v_cta_id, 'Check Availability',
   'https://wa.me/919025492090?text=Hi%21%20I%20want%20to%20check%20studio%20availability.', 2);

END $$;

COMMIT;
