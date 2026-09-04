export const parseNotesMetadata = (notes: string | null): { userNotes: string; metadata: any } => {
  if (!notes) return { userNotes: '', metadata: {} };
  const marker = '\n---METADATA---\n';
  const parts = notes.split(marker);
  if (parts.length > 1) {
    try {
      const metadata = JSON.parse(parts[1]);
      return { userNotes: parts[0], metadata };
    } catch (e) {
      // Ignore parsing error
    }
  }
  return { userNotes: notes, metadata: {} };
};

export const serializeNotesMetadata = (userNotes: string, metadata: any): string => {
  const marker = '\n---METADATA---\n';
  return `${userNotes}${marker}${JSON.stringify(metadata)}`;
};
