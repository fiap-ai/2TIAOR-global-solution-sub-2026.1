/** LLM replies sometimes use literal <br> tags; turn them into real newlines
 * (we render plain Markdown, no raw HTML) so they don't show up as text. */
export function normalizeMarkdown(md: string): string {
  return md.replace(/<br\s*\/?>/gi, "\n");
}
