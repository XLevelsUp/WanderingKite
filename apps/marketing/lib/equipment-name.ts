/** Strips trailing inventory serial numbers (e.g. `5502264`, `G250403867`) and unit suffixes (`Unit 2`) from public-facing equipment names. */
export function cleanEquipmentName(name: string): string {
  return name
    .replace(/\s+(?:[A-Z]{1,2}[A-Z0-9]*\d{6,}|\d{5,})$/, '')
    .replace(/\s+Unit\s+\d+$/i, '')
    .trim();
}
