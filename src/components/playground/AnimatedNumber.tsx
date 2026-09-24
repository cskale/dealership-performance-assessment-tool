import { ReactNode, useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: ReactNode;
  className?: string;
}

const NUMBER_PATTERN = /-?[\d.,]+/;

function parseFormattedNumber(value: string) {
  const match = value.match(NUMBER_PATTERN);
  if (!match || value.match(new RegExp(NUMBER_PATTERN.source, 'g'))?.length !== 1) return null;

  const token = match[0];
  const lastComma = token.lastIndexOf(',');
  const lastDot = token.lastIndexOf('.');
  const singleSeparator = lastComma >= 0 ? ',' : lastDot >= 0 ? '.' : '';
  const trailingDigits = singleSeparator ? token.length - Math.max(lastComma, lastDot) - 1 : 0;
  const hasBothSeparators = lastComma >= 0 && lastDot >= 0;
  const decimalMark = hasBothSeparators
    ? (lastComma > lastDot ? ',' : '.')
    : trailingDigits > 0 && trailingDigits !== 3 ? singleSeparator : '';
  const decimalPlaces = decimalMark ? token.length - Math.max(lastComma, lastDot) - 1 : 0;
  const normalized = decimalMark === ','
    ? token.replace(/\./g, '').replace(',', '.')
    : decimalMark === '.'
      ? token.replace(/,/g, '')
      : token.replace(/[.,]/g, '');
  const number = Number(normalized);

  if (!Number.isFinite(number)) return null;
  return {
    number,
    prefix: value.slice(0, match.index),
    suffix: value.slice((match.index ?? 0) + token.length),
    decimalPlaces,
    usesGermanSeparators: decimalMark === ',' || (!decimalMark && token.includes('.')),
  };
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const parsed = typeof value === 'number'
    ? { number: value, prefix: '', suffix: '', decimalPlaces: 0, usesGermanSeparators: true }
    : typeof value === 'string' ? parseFormattedNumber(value) : null;
  const previousValue = useRef(parsed?.number ?? 0);
  const [displayValue, setDisplayValue] = useState(parsed?.number ?? 0);

  useEffect(() => {
    if (!parsed) return;
    const destination = parsed.number;
    const origin = previousValue.current;
    previousValue.current = destination;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(destination);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 400);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(origin + (destination - origin) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [parsed?.number]);

  if (!parsed) return <span className={className}>{value}</span>;

  const formatted = new Intl.NumberFormat(parsed.usesGermanSeparators ? 'de-DE' : 'en-US', {
    minimumFractionDigits: parsed.decimalPlaces,
    maximumFractionDigits: parsed.decimalPlaces,
  }).format(displayValue);

  return (
    <span className={className} aria-label={String(value)}>
      {parsed.prefix}{formatted}{parsed.suffix}
    </span>
  );
}