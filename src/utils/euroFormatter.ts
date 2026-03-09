// European number and currency formatting utilities

export const formatEuro = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatEuroLarge = (amount: number): string => {
  if (amount >= 1000000) {
    return formatEuro(amount / 1000000) + 'M';
  } else if (amount >= 1000) {
    return formatEuro(amount / 1000) + 'K';
  }
  return formatEuro(amount);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};
