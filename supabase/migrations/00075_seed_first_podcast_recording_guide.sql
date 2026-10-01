-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — "How to Prepare for Your First Podcast Recording" post.
--
-- Third studiospace blog post (after 00069's launch post and 00071's studio
-- selection guide). section = 'STUDIO' so it renders on /studiospace, not the
-- photography blog. Same pattern: idempotent on slug, children deleted and
-- reinserted on re-run, matching the admin form's save behaviour.
--
-- Category note: the brief asked for "Podcast & Audio", but "BlogCategory"
-- (00066) only allows WEDDING_EVENT / PORTRAITS_LIFESTYLE / COMMERCIAL_BRAND /
-- TIPS_INSIGHTS. TIPS_INSIGHTS is used here, matching 00071's studio guide.
-- Adding a real PODCAST_AUDIO value would need an ALTER TYPE migration plus a
-- matching option in the admin category picker — deliberately not done here.
--
-- The featured image and the S2 in-post image are left NULL — upload them in
-- the dashboard (Blog → edit). Alt text is stored ready for when they are set.
--
-- CTA/link targets verified against live routes: /podcast is the podcast
-- studio page and /studiospace is the booking page. WhatsApp actions use the
-- STUDIO number (siteConfig.contact.studioWhatsapp = 919025492090), matching
-- 00069/00071 — not the photography number used by 00072/00074.
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
    'how-to-prepare-first-podcast-recording',
    'How to Prepare for Your First Podcast Recording: A Practical Guide',
    'STUDIO',
    'TIPS_INSIGHTS',
    'Professional podcast recording setup in a studio in Coimbatore',
    '<p>Starting a podcast can seem simple: choose a topic, sit in front of a microphone, and start talking. But producing a recording that sounds clear and looks professional requires a little more preparation.</p>'
    '<p>The recording environment, microphone placement, conversation structure, lighting, camera setup, and even guest preparation can affect the final result.</p>'
    '<p>For a first-time podcaster, the goal is not to make everything complicated. It is to understand what needs to be prepared before entering the recording space so that the actual session can run smoothly.</p>'
    '<p>Whether you are recording an interview, business podcast, educational conversation, or personal-content series, preparing in advance can save time and make the recording experience more comfortable.</p>',
    'Studio Space Coimbatore Team',
    ARRAY[
      'Podcast Recording Coimbatore',
      'Podcast Studio Coimbatore',
      'Podcast Recording Studio',
      'Podcast Setup',
      'Podcast Preparation',
      'Professional Podcast Recording',
      'Studio Space Coimbatore'
    ],
    8,
    now(),
    'How to Prepare for Your First Podcast Recording | Studio Space Coimbatore',
    'Planning your first podcast? Learn how to prepare your topic, audio setup, guest, lighting, cameras, and recording environment for a smoother podcast session.'
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

  -- ── S2 (carries the in-post image: mic/headphones pre-session close-up) ──
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, image_alt, sort_order)
  VALUES (
    v_post_id,
    'What Should You Prepare Before a Podcast Recording?',
    '<p>A successful podcast recording starts before the microphones are switched on.</p>'
    '<p>There are several things worth deciding in advance, from the format of the episode to the recording environment.</p>',
    'RICH_TEXT',
    'Podcast microphone and audio recording equipment prepared for a studio session',
    0
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Define Your Podcast Format',
   '<p>Before booking a recording session, decide what type of podcast you are creating.</p>'
   '<p>It could be:</p>'
   '<ul>'
   '<li>A one-person podcast</li>'
   '<li>An interview</li>'
   '<li>A two-person conversation</li>'
   '<li>A panel discussion</li>'
   '<li>A business or industry podcast</li>'
   '<li>An educational podcast</li>'
   '<li>A video podcast</li>'
   '</ul>'
   '<p>The format affects the number of people involved, microphone requirements, camera angles, seating arrangement, and studio setup.</p>'
   '<p>Having a clear format makes it easier to prepare the recording space according to the actual requirements of the episode.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Prepare Your Topic and Questions',
   '<p>A podcast does not necessarily need a completely scripted conversation.</p>'
   '<p>For many formats, having a clear discussion structure is enough.</p>'
   '<p>Before the recording, prepare:</p>'
   '<ul>'
   '<li>The main topic</li>'
   '<li>Key discussion points</li>'
   '<li>Questions for the guest</li>'
   '<li>Important information that should not be missed</li>'
   '<li>Introduction and closing points</li>'
   '<li>Any specific calls to action</li>'
   '</ul>'
   '<p>For an interview, sharing the general topics or questions with the guest beforehand can also make the conversation more natural.</p>'
   '<p>The objective is not to make every sentence predictable. It is to give the conversation a clear direction.</p>',
   'BULLET_LIST', 1),
  (v_section_id, 'Choose the Right Recording Setup',
   '<p>Audio quality is one of the most important parts of a podcast.</p>'
   '<p>Even a visually attractive video can become difficult to watch if the voices are unclear or inconsistent.</p>'
   '<p>Before recording, consider:</p>'
   '<ul>'
   '<li>How many people will be speaking?</li>'
   '<li>Will everyone need an individual microphone?</li>'
   '<li>Will the episode be audio-only or video?</li>'
   '<li>Will headphones be required?</li>'
   '<li>How will the microphones be positioned?</li>'
   '<li>Where will the participants sit?</li>'
   '</ul>'
   '<p>The setup should allow everyone to speak comfortably without constantly moving toward or away from the microphone.</p>'
   '<p>A properly arranged recording environment also reduces the need for unnecessary adjustments during the session.</p>',
   'BULLET_LIST', 2),
  (v_section_id, 'Check Audio and Microphone Requirements',
   '<p>Microphone technique matters almost as much as the microphone itself.</p>'
   '<p>Participants should understand basic recording habits before the session begins. For example:</p>'
   '<ul>'
   '<li>Keep a consistent distance from the microphone.</li>'
   '<li>Avoid touching or moving the microphone during recording.</li>'
   '<li>Reduce unnecessary background noise.</li>'
   '<li>Avoid placing objects that can create noise near the microphone.</li>'
   '<li>Speak naturally rather than trying to project excessively.</li>'
   '<li>Test the microphone before beginning the actual recording.</li>'
   '</ul>'
   '<p>A short sound check can help identify problems before the main conversation starts.</p>'
   '<p>This is particularly useful when recording an important interview or branded podcast episode.</p>',
   'BULLET_LIST', 3),
  (v_section_id, 'Plan the Video and Visual Setup',
   '<p>If the podcast will also be published as video, audio is only one part of the production.</p>'
   '<p>Think about:</p>'
   '<ul>'
   '<li>Camera positioning</li>'
   '<li>Framing</li>'
   '<li>Background</li>'
   '<li>Lighting</li>'
   '<li>Seating arrangement</li>'
   '<li>Branding elements</li>'
   '<li>Multiple camera angles, if required</li>'
   '</ul>'
   '<p>The background should support the subject rather than distract from the conversation.</p>'
   '<p>Lighting should also provide enough visibility while creating a consistent appearance between speakers.</p>'
   '<p>A podcast recording space that considers both audio and visual production can make the content easier to repurpose for platforms such as YouTube and social media.</p>',
   'BULLET_LIST', 4);

  -- ── S3 ──────────────────────────────────────────────────────────────────
  INSERT INTO public.blog_sections (post_id, heading, body, body_type, sort_order)
  VALUES (
    v_post_id,
    'How to Make Your Podcast Recording Session Smoother',
    '<p>Preparation does not have to be complicated.</p>'
    '<p>A simple workflow can make the recording session more efficient and comfortable.</p>',
    'RICH_TEXT', 1
  ) RETURNING id INTO v_section_id;

  INSERT INTO public.blog_subsections (section_id, heading, body, body_type, sort_order) VALUES
  (v_section_id, 'Test Everything Before Recording',
   '<p>Do not wait until the main conversation starts to discover an audio or camera problem.</p>'
   '<p>Before recording, check:</p>'
   '<ul>'
   '<li>Microphones</li>'
   '<li>Headphones</li>'
   '<li>Camera framing</li>'
   '<li>Lighting</li>'
   '<li>Recording levels</li>'
   '<li>Seating positions</li>'
   '<li>Background</li>'
   '<li>Storage or recording media</li>'
   '</ul>'
   '<p>A short test recording can help identify issues that may not be obvious during a quick equipment check.</p>'
   '<p>Once everything is confirmed, the actual recording can begin with fewer interruptions.</p>',
   'BULLET_LIST', 0),
  (v_section_id, 'Prepare the Guest',
   '<p>Guests can have very different levels of recording experience.</p>'
   '<p>Some may be comfortable speaking into a microphone, while others may be doing their first podcast or video interview.</p>'
   '<p>Before the session, explain:</p>'
   '<ul>'
   '<li>Where they will sit</li>'
   '<li>How the microphone should be used</li>'
   '<li>Where they should look</li>'
   '<li>How the conversation will work</li>'
   '<li>Whether retakes are possible</li>'
   '<li>How long the recording is expected to take</li>'
   '</ul>'
   '<p>This can make the guest feel more comfortable and reduce unnecessary hesitation during the recording.</p>'
   '<p>A relaxed guest often makes the conversation feel more natural.</p>',
   'BULLET_LIST', 1),
  (v_section_id, 'Manage the Recording Environment',
   '<p>A podcast requires more than microphones and cameras.</p>'
   '<p>The surrounding environment can also affect the recording.</p>'
   '<p>Try to minimise avoidable distractions such as:</p>'
   '<ul>'
   '<li>Unnecessary background conversations</li>'
   '<li>Loud equipment</li>'
   '<li>Phone notifications</li>'
   '<li>People moving around during recording</li>'
   '<li>Objects being moved near the microphones</li>'
   '<li>Sudden interruptions</li>'
   '</ul>'
   '<p>The more controlled the environment is, the easier it becomes to maintain consistent audio and video throughout the session.</p>',
   'BULLET_LIST', 2),
  (v_section_id, 'Record With Post-Production in Mind',
   '<p>Podcast content can often become more than one finished episode.</p>'
   '<p>A single recording may be edited into:</p>'
   '<ul>'
   '<li>Full podcast episodes</li>'
   '<li>Short video clips</li>'
   '<li>Social media reels</li>'
   '<li>Educational snippets</li>'
   '<li>Quote-based content</li>'
   '<li>Promotional clips</li>'
   '</ul>'
   '<p>Because of this, think about the final content requirements before recording.</p>'
   '<p>If short-form content is important, identify moments during the conversation that could work as standalone clips.</p>'
   '<p>Recording with repurposing in mind can help you get more usable content from a single studio session.</p>',
   'BULLET_LIST', 3),
  (v_section_id, 'Quick Checklist',
   '<p>Before starting your podcast recording, use this simple checklist:</p>'
   '<p><strong>Content</strong></p>'
   '<ul>'
   '<li>Topic confirmed</li>'
   '<li>Questions prepared</li>'
   '<li>Guest briefed</li>'
   '<li>Introduction and closing prepared</li>'
   '</ul>'
   '<p><strong>Audio</strong></p>'
   '<ul>'
   '<li>Microphones tested</li>'
   '<li>Headphones checked</li>'
   '<li>Recording levels checked</li>'
   '<li>Background noise controlled</li>'
   '</ul>'
   '<p><strong>Video</strong></p>'
   '<ul>'
   '<li>Cameras positioned</li>'
   '<li>Framing checked</li>'
   '<li>Lighting checked</li>'
   '<li>Background prepared</li>'
   '</ul>'
   '<p><strong>Session</strong></p>'
   '<ul>'
   '<li>Recording duration planned</li>'
   '<li>Guest comfortable</li>'
   '<li>Equipment tested</li>'
   '<li>Backup requirements considered</li>'
   '</ul>'
   '<p>A few minutes of preparation can prevent many avoidable problems during the actual recording.</p>',
   'BULLET_LIST', 4),
  (v_section_id, 'Podcast Recording at Studio Space Coimbatore',
   '<p>For creators, businesses, and individuals who want to record podcast content in a dedicated environment, Studio Space Coimbatore provides a space designed for recording-based content.</p>'
   '<p>A dedicated <a href="/podcast">podcast recording in Coimbatore</a> setup can help bring together the space, recording environment, audio requirements, and visual setup needed for a professional session.</p>'
   '<p>Whether you are planning an interview, business conversation, educational podcast, or video podcast, preparing your content and technical requirements beforehand can help you make better use of your recording session.</p>'
   '<p>The focus should always be on creating a comfortable environment where the conversation feels natural while the recording quality remains consistent.</p>',
   'RICH_TEXT', 5);

  -- ── S4 — Q&A ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_qa (post_id, question, answer, sort_order) VALUES
  (v_post_id, 'What should I prepare before my first podcast recording?',
   '<p>Prepare your topic, questions, guest details, recording format, microphone requirements, and any video requirements. It is also useful to test the complete setup before starting.</p>', 0),
  (v_post_id, 'Do I need a script for a podcast?',
   '<p>Not always. A full script may be useful for certain formats, but interviews and conversational podcasts can often work better with a structured list of questions and discussion points.</p>', 1),
  (v_post_id, 'Is audio quality important for a video podcast?',
   '<p>Yes. Viewers may tolerate simple visuals, but unclear or inconsistent audio can make a podcast difficult to follow. Good microphone placement and a controlled recording environment are important.</p>', 2),
  (v_post_id, 'Can one podcast recording create social media content?',
   '<p>Yes. A longer podcast episode can often be edited into shorter clips, reels, educational snippets, quotes, and promotional content. Planning for this before recording can make content repurposing easier.</p>', 3),
  (v_post_id, 'Can beginners record podcasts in a professional studio?',
   '<p>Yes. A professional recording environment can be useful for beginners because the space and setup can reduce some of the technical challenges involved in creating a podcast from scratch.</p>', 4);

  -- ── S5 — CTA ────────────────────────────────────────────────────────────
  INSERT INTO public.blog_cta (post_id, heading, body)
  VALUES (
    v_post_id,
    'Ready to Record Your Podcast?',
    '<p>Planning your first podcast does not have to be complicated.</p>'
    '<p>Start with a clear topic, prepare your conversation, understand your recording requirements, and test the setup before the session begins.</p>'
    '<p>If you are looking for a dedicated space for podcast and content recording in Coimbatore, explore Studio Space Coimbatore and plan your next recording session with the right setup for your project.</p>'
  ) RETURNING id INTO v_cta_id;

  -- /podcast is the podcast studio page and /studiospace is the booking page.
  -- WhatsApp actions use the STUDIO number (919025492090), matching 00069/00071.
  INSERT INTO public.blog_cta_buttons (cta_id, label, href, sort_order) VALUES
  (v_cta_id, 'Explore Podcast Studio', '/podcast', 0),
  (v_cta_id, 'Book Your Studio Session',
   'https://wa.me/919025492090?text=Hi%21%20I%20want%20to%20book%20a%20podcast%20recording%20session.', 1),
  (v_cta_id, 'Check Availability',
   'https://wa.me/919025492090?text=Hi%21%20I%20want%20to%20check%20studio%20availability.', 2);

END $$;

COMMIT;
