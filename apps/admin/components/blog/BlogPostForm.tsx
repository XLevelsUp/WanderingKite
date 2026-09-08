'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, ChevronUp, ChevronDown, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { RichTextEditor } from '@/components/blog/RichTextEditor';

import {
  BLOG_BODY_TYPES,
  BLOG_IMAGE_FITS,
  BLOG_SECTIONS,
  BODY_TYPE_LABELS,
  IMAGE_FIT_LABELS,
  CATEGORY_LABELS,
  categoriesForSection,
  estimateReadingTime,
  slugify,
  type BlogBodyType,
  type BlogImageFit,
  type BlogCategory,
  type BlogSectionKey,
} from '@/lib/blog';
import { createBlogPost, updateBlogPost } from '@/actions/blog-admin';

// ── Local form shapes ────────────────────────────────────────────────────────

interface SubsectionDraft {
  heading: string;
  body: string;
  bodyType: BlogBodyType;
}
interface SectionDraft {
  heading: string;
  body: string;
  bodyType: BlogBodyType;
  image: string;
  imageAlt: string;
  imageFit: BlogImageFit;
  subsections: SubsectionDraft[];
}
interface QaDraft {
  question: string;
  answer: string;
}
interface CtaButtonDraft {
  label: string;
  href: string;
}

export interface BlogPostFormProps {
  /** Existing post row (with nested children) when editing. */
  initialPost?: any;
}

const BODY_TYPE_HINT =
  'Paragraphs for prose; numbered steps for a process; bulleted list for a set of points.';

function toDateInput(value: string | Date | undefined): string {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function BlogPostForm({ initialPost }: BlogPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(initialPost?.id);

  const [title, setTitle] = useState<string>(initialPost?.title ?? '');
  const [slug, setSlug] = useState<string>(initialPost?.slug ?? '');
  // Once a post is live its slug is a real URL, so stop auto-syncing on edit.
  const [slugTouched, setSlugTouched] = useState<boolean>(isEdit);
  const [section, setSection] = useState<BlogSectionKey>(
    (initialPost?.section as BlogSectionKey) ?? 'PHOTOGRAPHY'
  );
  const [category, setCategory] = useState<BlogCategory | ''>(
    initialPost?.category ?? ''
  );
  const [author, setAuthor] = useState<string>(
    initialPost?.author ?? 'Wandering Kite Photography Team'
  );
  const [tagsInput, setTagsInput] = useState<string>(
    (initialPost?.tags ?? []).join(', ')
  );
  const [publishedAt, setPublishedAt] = useState<string>(
    toDateInput(initialPost?.published_at)
  );
  const [readingTime, setReadingTime] = useState<number>(
    initialPost?.reading_time ?? 5
  );

  const [featuredImage, setFeaturedImage] = useState<string>(
    initialPost?.featured_image ?? ''
  );
  const [featuredImageAlt, setFeaturedImageAlt] = useState<string>(
    initialPost?.featured_image_alt ?? ''
  );
  const [featuredImageFit, setFeaturedImageFit] = useState<BlogImageFit>(
    (initialPost?.featured_image_fit as BlogImageFit) ?? 'COVER'
  );

  const [intro, setIntro] = useState<string>(initialPost?.intro ?? '');

  const [metaTitle, setMetaTitle] = useState<string>(initialPost?.meta_title ?? '');
  const [metaDescription, setMetaDescription] = useState<string>(
    initialPost?.meta_description ?? ''
  );

  const [sections, setSections] = useState<SectionDraft[]>(
    (initialPost?.blog_sections ?? []).map((s: any) => ({
      heading: s.heading ?? '',
      body: s.body ?? '',
      bodyType: (s.body_type ?? 'RICH_TEXT') as BlogBodyType,
      image: s.image ?? '',
      imageAlt: s.image_alt ?? '',
      imageFit: (s.image_fit ?? 'COVER') as BlogImageFit,
      subsections: (s.blog_subsections ?? []).map((sub: any) => ({
        heading: sub.heading ?? '',
        body: sub.body ?? '',
        bodyType: (sub.body_type ?? 'RICH_TEXT') as BlogBodyType,
      })),
    }))
  );

  const [qa, setQa] = useState<QaDraft[]>(
    (initialPost?.blog_qa ?? []).map((q: any) => ({
      question: q.question ?? '',
      answer: q.answer ?? '',
    }))
  );

  const [ctaHeading, setCtaHeading] = useState<string>(
    initialPost?.blog_cta?.heading ?? ''
  );
  const [ctaBody, setCtaBody] = useState<string>(initialPost?.blog_cta?.body ?? '');
  const [ctaButtons, setCtaButtons] = useState<CtaButtonDraft[]>(
    (initialPost?.blog_cta?.blog_cta_buttons ?? []).map((b: any) => ({
      label: b.label ?? '',
      href: b.href ?? '',
    }))
  );

  // ── Section helpers ────────────────────────────────────────────────────────

  const updateSection = (i: number, patch: Partial<SectionDraft>) =>
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const moveSection = (i: number, delta: number) =>
    setSections((prev) => {
      const next = [...prev];
      const target = i + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });

  const updateSubsection = (si: number, subi: number, patch: Partial<SubsectionDraft>) =>
    setSections((prev) =>
      prev.map((s, idx) =>
        idx === si
          ? {
              ...s,
              subsections: s.subsections.map((sub, j) =>
                j === subi ? { ...sub, ...patch } : sub
              ),
            }
          : s
      )
    );

  const autoReadingTime = () => {
    const estimate = estimateReadingTime(
      intro,
      ...sections.flatMap((s) => [s.body, ...s.subsections.map((sub) => sub.body)]),
      ...qa.map((q) => q.answer)
    );
    setReadingTime(estimate);
    toast.success(`Estimated ${estimate} min from the current content.`);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      section,
      category: category as BlogCategory,
      featuredImage,
      featuredImageAlt,
      featuredImageFit,
      intro,
      author: author.trim(),
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      readingTime: Number(readingTime) || 1,
      publishedAt,
      metaTitle,
      metaDescription,
      sections: sections.map((s, i) => ({
        heading: s.heading.trim(),
        body: s.body,
        bodyType: s.bodyType,
        image: s.image,
        imageAlt: s.imageAlt,
        imageFit: s.imageFit,
        sortOrder: i,
        subsections: s.subsections.map((sub, j) => ({
          heading: sub.heading.trim(),
          body: sub.body,
          bodyType: sub.bodyType,
          sortOrder: j,
        })),
      })),
      qa: qa.map((q, i) => ({
        question: q.question.trim(),
        answer: q.answer,
        sortOrder: i,
      })),
      cta: {
        heading: ctaHeading.trim(),
        body: ctaBody,
        buttons: ctaButtons
          .filter((b) => b.label.trim() && b.href.trim())
          .map((b, i) => ({ label: b.label.trim(), href: b.href.trim(), sortOrder: i })),
      },
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateBlogPost(initialPost.id, payload)
        : await createBlogPost(payload);

      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? 'Post updated and live.' : 'Post published.');
      router.push('/blog');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Basics ─────────────────────────────────────────────────────────── */}
      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="text-lg">Post details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="The Wandering Kite Story…"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="the-wandering-kite-story"
                required
                disabled={isPending}
              />
              <p className="text-xs text-slate-500">/blog/{slug || 'your-slug'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="section">Blog *</Label>
              <select
                id="section"
                value={section}
                onChange={(e) => {
                  const next = e.target.value as BlogSectionKey;
                  setSection(next);
                  // The two blogs have separate category lists, so a category
                  // chosen for one is never valid for the other.
                  setCategory('');
                }}
                required
                disabled={isPending}
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                {BLOG_SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'STUDIO' ? 'Studio Space' : 'Photography'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {section === 'STUDIO' ? '/studiospace/blog' : '/blog'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as BlogCategory)}
                required
                disabled={isPending}
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                <option value="">Select a category…</option>
                {categoriesForSection(section).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="publishedAt">Publish date *</Label>
              <Input
                id="publishedAt"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="readingTime">Reading time (min) *</Label>
              <div className="flex gap-2">
                <Input
                  id="readingTime"
                  type="number"
                  min={1}
                  max={120}
                  value={readingTime}
                  onChange={(e) => setReadingTime(Number(e.target.value))}
                  required
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={autoReadingTime}
                  disabled={isPending}
                  title="Estimate from content"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Photography Coimbatore, Visual Storytelling"
                disabled={isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Featured image ─────────────────────────────────────────────────── */}
      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="text-lg">Featured image</CardTitle>
          <p className="text-xs text-slate-500">
            Shown on the listing card and as the hero on the post itself.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            value={featuredImage}
            onChange={setFeaturedImage}
            bucket="equipment-images"
            folder="blog"
            disabled={isPending}
          />
          <div className="space-y-2">
            <Label htmlFor="featuredAlt">
              Alt text {featuredImage ? '*' : <span className="text-slate-500">(optional)</span>}
            </Label>
            <Input
              id="featuredAlt"
              value={featuredImageAlt}
              onChange={(e) => setFeaturedImageAlt(e.target.value)}
              placeholder="Wandering Kite Photography capturing…"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="featuredFit">How it fills the frame</Label>
            <select
              id="featuredFit"
              value={featuredImageFit}
              onChange={(e) => setFeaturedImageFit(e.target.value as BlogImageFit)}
              disabled={isPending}
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white md:w-80"
            >
              {BLOG_IMAGE_FITS.map((f) => (
                <option key={f} value={f}>
                  {IMAGE_FIT_LABELS[f]}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              Fill suits wide photographs; fit suits portraits, posters and
              anything where the edges matter.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Introduction ───────────────────────────────────────────────────── */}
      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="text-lg">Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor value={intro} onChange={setIntro} disabled={isPending} />
        </CardContent>
      </Card>

      {/* ── Sections ───────────────────────────────────────────────────────── */}
      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Sections</CardTitle>
            <p className="text-xs text-slate-500">{BODY_TYPE_HINT}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              setSections((prev) => [
                ...prev,
                { heading: '', body: '', bodyType: 'RICH_TEXT', image: '', imageAlt: '', imageFit: 'COVER', subsections: [] },
              ])
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add section
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections.length === 0 && (
            <p className="text-sm italic text-slate-500">No sections yet.</p>
          )}

          {sections.map((section, i) => (
            <div key={i} className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Label>Section {i + 1} heading *</Label>
                  <Input
                    value={section.heading}
                    onChange={(e) => updateSection(i, { heading: e.target.value })}
                    placeholder="What inspires the Wandering Kite approach?"
                    disabled={isPending}
                  />
                </div>
                <div className="flex gap-1 pt-7">
                  <Button type="button" variant="ghost" size="icon" disabled={isPending || i === 0}
                    onClick={() => moveSection(i, -1)} title="Move up">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon"
                    disabled={isPending || i === sections.length - 1}
                    onClick={() => moveSection(i, 1)} title="Move down">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" disabled={isPending}
                    onClick={() => setSections((prev) => prev.filter((_, idx) => idx !== i))}
                    title="Remove section">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Body style</Label>
                <select
                  value={section.bodyType}
                  onChange={(e) => updateSection(i, { bodyType: e.target.value as BlogBodyType })}
                  disabled={isPending}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white md:w-64"
                >
                  {BLOG_BODY_TYPES.map((t) => (
                    <option key={t} value={t}>{BODY_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <RichTextEditor
                value={section.body}
                onChange={(html) => updateSection(i, { body: html })}
                disabled={isPending}
              />

              <div className="space-y-3 rounded-lg border border-slate-800/70 p-3">
                <p className="text-xs text-slate-500">
                  Optional image — renders after this section&apos;s text, before its sub-sections.
                </p>
                <ImageUpload
                  value={section.image}
                  onChange={(url) => updateSection(i, { image: url })}
                  bucket="equipment-images"
                  folder="blog"
                  disabled={isPending}
                />
                {section.image && (
                  <>
                    <Input
                      value={section.imageAlt}
                      onChange={(e) => updateSection(i, { imageAlt: e.target.value })}
                      placeholder="Alt text (required when an image is set)"
                      disabled={isPending}
                    />
                    <select
                      value={section.imageFit}
                      onChange={(e) =>
                        updateSection(i, { imageFit: e.target.value as BlogImageFit })
                      }
                      disabled={isPending}
                      className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white md:w-72"
                    >
                      {BLOG_IMAGE_FITS.map((f) => (
                        <option key={f} value={f}>
                          {IMAGE_FIT_LABELS[f]}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              {/* Sub-sections */}
              <div className="space-y-3 border-l-2 border-slate-800 pl-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wide text-slate-400">
                    Sub-sections
                  </Label>
                  <Button type="button" variant="ghost" size="sm" disabled={isPending}
                    onClick={() =>
                      updateSection(i, {
                        subsections: [
                          ...section.subsections,
                          { heading: '', body: '', bodyType: 'RICH_TEXT' },
                        ],
                      })
                    }>
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>

                {section.subsections.map((sub, j) => (
                  <div key={j} className="space-y-2 rounded-lg bg-slate-900/40 p-3">
                    <div className="flex gap-2">
                      <Input
                        value={sub.heading}
                        onChange={(e) => updateSubsection(i, j, { heading: e.target.value })}
                        placeholder="Sub-section heading"
                        disabled={isPending}
                      />
                      <Button type="button" variant="ghost" size="icon" disabled={isPending}
                        onClick={() =>
                          updateSection(i, {
                            subsections: section.subsections.filter((_, idx) => idx !== j),
                          })
                        }>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                    <select
                      value={sub.bodyType}
                      onChange={(e) =>
                        updateSubsection(i, j, { bodyType: e.target.value as BlogBodyType })
                      }
                      disabled={isPending}
                      className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white md:w-56"
                    >
                      {BLOG_BODY_TYPES.map((t) => (
                        <option key={t} value={t}>{BODY_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                    <RichTextEditor
                      value={sub.body}
                      onChange={(html) => updateSubsection(i, j, { body: html })}
                      disabled={isPending}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Q&A ────────────────────────────────────────────────────────────── */}
      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Q&amp;A</CardTitle>
          <Button type="button" variant="outline" size="sm" disabled={isPending}
            onClick={() => setQa((prev) => [...prev, { question: '', answer: '' }])}>
            <Plus className="mr-1 h-4 w-4" /> Add question
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {qa.length === 0 && (
            <p className="text-sm italic text-slate-500">No questions yet.</p>
          )}
          {qa.map((item, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex gap-2">
                <Input
                  value={item.question}
                  onChange={(e) =>
                    setQa((prev) => prev.map((q, idx) => (idx === i ? { ...q, question: e.target.value } : q)))
                  }
                  placeholder="What type of photography does Wandering Kite offer?"
                  disabled={isPending}
                />
                <Button type="button" variant="ghost" size="icon" disabled={isPending}
                  onClick={() => setQa((prev) => prev.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
              <RichTextEditor
                value={item.answer}
                onChange={(html) =>
                  setQa((prev) => prev.map((q, idx) => (idx === i ? { ...q, answer: html } : q)))
                }
                disabled={isPending}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="text-lg">Call to action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ctaHeading">Heading</Label>
            <Input
              id="ctaHeading"
              value={ctaHeading}
              onChange={(e) => setCtaHeading(e.target.value)}
              placeholder="Ready to Tell Your Story?"
              disabled={isPending}
            />
          </div>
          <RichTextEditor value={ctaBody} onChange={setCtaBody} disabled={isPending} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-slate-400">Buttons</Label>
              <Button type="button" variant="ghost" size="sm" disabled={isPending}
                onClick={() => setCtaButtons((prev) => [...prev, { label: '', href: '' }])}>
                <Plus className="mr-1 h-3 w-3" /> Add button
              </Button>
            </div>
            {ctaButtons.map((btn, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={btn.label}
                  onChange={(e) =>
                    setCtaButtons((prev) => prev.map((b, idx) => (idx === i ? { ...b, label: e.target.value } : b)))
                  }
                  placeholder="Explore Photography"
                  disabled={isPending}
                />
                <Input
                  value={btn.href}
                  onChange={(e) =>
                    setCtaButtons((prev) => prev.map((b, idx) => (idx === i ? { ...b, href: e.target.value } : b)))
                  }
                  placeholder="/photography"
                  disabled={isPending}
                />
                <Button type="button" variant="ghost" size="icon" disabled={isPending}
                  onClick={() => setCtaButtons((prev) => prev.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── SEO ────────────────────────────────────────────────────────────── */}
      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="text-lg">SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta title</Label>
            <Input
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Falls back to the post title"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta description</Label>
            <Input
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Falls back to an excerpt of the introduction"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Publish post'}
        </Button>
      </div>
    </form>
  );
}
