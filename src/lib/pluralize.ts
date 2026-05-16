// Bug #200: Tiny pluralization helper so we don't end up with "1 items" or
// "0 product found" in the UI. Use as `pluralize(n, 'item')` or
// `pluralize(n, 'category', 'categories')` when the plural is irregular.
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/** `${count} ${singular|plural}` — e.g. `pcount(2, 'item')` → "2 items". */
export function pcount(count: number, singular: string, plural?: string): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}
