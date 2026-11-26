/**
 * Capitalises the first letter of every word in a heading.
 * Only touches lowercase first letters, so acronyms ("AI", "STEM") and
 * existing capitals are left as they are. Hyphenated parts count as words.
 */
export function titleCase(text: string): string {
  return text.replace(/(^|[\s\-/(])(\p{Ll})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}
