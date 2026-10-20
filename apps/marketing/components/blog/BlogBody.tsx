import Image from 'next/image';
import { imageFitClass } from '@/lib/blog';

/**
 * Renders one rich-text body.
 *
 * The editor only ever produces bold, italic, links and lists, so the stored
 * HTML is a narrow, known set of tags authored through our own admin — not
 * arbitrary user input. Lists carry their own <ul>/<ol> markup, so the
 * section's body_type drives how it is authored, not how it is rendered.
 */
function RichBody({ html }: { html: string }) {
  if (!html) return null;

  // Styled with a plain class rather than Tailwind's prose-* utilities:
  // @tailwindcss/typography is not installed in this project, so every
  // prose-* class silently does nothing — and Tailwind's preflight strips
  // list-style and padding from <ul>/<ol>, which is why lists rendered as
  // unmarked lines. See .blog-body in app/globals.css.
  return (
    <div className="blog-body" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

interface BlogBodyProps {
  intro: string;
  sections: any[];
  qa: any[];
  cta: any | null;
}

export function BlogBody({ intro, sections, qa, cta }: BlogBodyProps) {
  return (
    <div className="space-y-14">
      {intro && (
        <section>
          <RichBody html={intro} />
        </section>
      )}

      {sections.map((section: any) => (
        <section key={section.id} className="space-y-5">
          <h2 className="text-2xl font-bold text-amber-500 md:text-3xl">
            {section.heading}
          </h2>

          <RichBody html={section.body} />

          {/* Section image renders after the full body, before sub-sections —
              images are never positioned mid-paragraph. */}
          {section.image && (
            <figure className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-card">
              <Image
                src={section.image}
                alt={section.image_alt ?? section.heading}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className={imageFitClass(section.image_fit)}
              />
            </figure>
          )}

          {(section.blog_subsections ?? []).map((sub: any) => (
            <div key={sub.id} className="space-y-3 pt-2">
              <h3 className="text-xl font-semibold text-amber-400">{sub.heading}</h3>
              <RichBody html={sub.body} />
            </div>
          ))}
        </section>
      ))}

      {qa.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-500 md:text-3xl">
            Questions &amp; Answers
          </h2>
          <div className="space-y-5">
            {qa.map((item: any) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-card/40 p-6"
              >
                <h3 className="mb-2 text-base font-semibold text-amber-400">
                  {item.question}
                </h3>
                <RichBody html={item.answer} />
              </div>
            ))}
          </div>
        </section>
      )}

      {cta && (cta.heading || cta.body || (cta.blog_cta_buttons ?? []).length > 0) && (
        <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-8 md:p-10">
          {cta.heading && (
            <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
              {cta.heading}
            </h2>
          )}
          <RichBody html={cta.body} />

          {(cta.blog_cta_buttons ?? []).length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {cta.blog_cta_buttons.map((button: any) => (
                <a
                  key={button.id}
                  href={button.href}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
                >
                  {button.label}
                </a>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
