/** Split long text into overlapping-ish chunks for embedding. */
export function chunkText(text: string, maxChars = 1800): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const parts: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(start + maxChars, normalized.length);
    let slice = normalized.slice(start, end);
    if (end < normalized.length) {
      const lastBreak = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf(". "));
      if (lastBreak > maxChars * 0.4) {
        slice = slice.slice(0, lastBreak + 1);
      }
    }
    parts.push(slice.trim());
    start += slice.length;
  }

  return parts.filter(Boolean);
}
