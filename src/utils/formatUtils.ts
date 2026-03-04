/**
 * Format a number into a compact string with a "+" suffix.
 * Examples: 847 → "847+", 2400 → "2.4k+", 15000 → "15k+", 1500000 → "1.5M+"
 */
export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) {
    const val = n / 1_000_000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, '');
    return `${formatted}M+`;
  }
  if (n >= 1_000) {
    const val = n / 1_000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, '');
    return `${formatted}k+`;
  }
  return `${n}+`;
}
