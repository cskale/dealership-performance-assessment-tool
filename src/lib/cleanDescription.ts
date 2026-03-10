/**
 * Strip "Triggered because:" from any user-visible text.
 * This is internal signal engine metadata and should never be shown to users.
 */
export function cleanDescription(text: string | null): string {
  if (!text) return '';
  return text.replace(/\s*Triggered because:.*$/si, '').trim();
}
