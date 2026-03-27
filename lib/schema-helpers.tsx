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
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
