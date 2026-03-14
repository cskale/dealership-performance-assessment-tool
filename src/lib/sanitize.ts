/**
 * Strip HTML tags and dangerous characters from user-supplied input.
 * Applied before database inserts AND before PDF/report generation.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (input === null || input === undefined || input === '') return '';
  return input
    .replace(/<[^>]*>/g, '')           // strip all HTML tags
    .replace(/javascript:/gi, '')       // strip JS URI protocol
    .replace(/on\w+\s*=/gi, '')         // strip event handler attributes (onclick=, onload=, etc.)
    .replace(/</g, '&lt;')             // encode any remaining <
    .replace(/>/g, '&gt;')             // encode any remaining >
    .trim();
}

export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data } as Record<string, unknown>;
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeText(result[key] as string);
    }
  }
  return result as T;
}
