import { de, enGB, es, fr, it, type Locale } from 'date-fns/locale';

/** date-fns locale for the app language, so `format(d, 'd MMM yyyy', { locale })` shows translated months. */
export const DATE_LOCALES: Record<string, Locale> = { en: enGB, de, es, fr, it };
