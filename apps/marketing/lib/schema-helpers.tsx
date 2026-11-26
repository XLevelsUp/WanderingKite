/**
 * schema-helpers.tsx
 * Utility component for injecting JSON-LD structured data into pages.
 * Accepts a single schema object or an array of schema objects.
 */

export function JsonLd({ data }: { data: object | object[] }) {
  const schemas = Array.isArray(data) ? data : [data];
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export interface ReviewSource {
  name: string;
  content: string;
  rating: number;
}

/** Builds JSON-LD `aggregateRating` and `review` blocks from visible page reviews so structured data stays synced with the UI. */
export function buildReviewSchema(reviews: readonly ReviewSource[]) {
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1);
  return {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(Number(avg.toFixed(1))),
      bestRating: '5',
      worstRating: '1',
      ratingCount: String(reviews.length),
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(r.rating),
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: r.content,
    })),
  };
}
