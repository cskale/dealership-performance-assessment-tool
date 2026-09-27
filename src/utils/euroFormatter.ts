// European number and currency formatting utilities

const LOCALES: Record<string, string> = { en: 'en-IE', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', it: 'it-IT' };

/** Number locale for the current app language (en → en-IE: "€100,000"; de → "100.000 €"). */
export const numberLocale = (): string => {
  try {
    return LOCALES[localStorage.getItem('app_language') ?? 'en'] ?? 'en-IE';
  } catch {
    return 'en-IE';
  }
};

export const formatEuro = (amount: number): string => {
  return new Intl.NumberFormat(numberLocale(), {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatEuroLarge = (amount: number): string => {
  // compact notation: the old formatEuro(n / 1000) + 'K' rendered "100 €K" in de-DE
  return new Intl.NumberFormat(numberLocale(), {
    style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat(numberLocale(), {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat(numberLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};
