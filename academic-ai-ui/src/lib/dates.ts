// Robust timestamp parsing helper
// Tries to parse ISO timestamps with or without timezone. Falls back to appending +05:30 (IST)
export function parseToDate(ts: string | undefined | null): Date | null {
  if (!ts) return null;

  try {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d;
  } catch {}

  // If ts looks like an ISO without timezone, append IST
  // e.g., 2026-01-15T15:38:27.627167
  const isoNoTzRegex = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
  if (isoNoTzRegex.test(ts)) {
    const withTz = ts + "+05:30";
    const d2 = new Date(withTz);
    if (!isNaN(d2.getTime())) return d2;
  }

  // Try replacing space with T if present
  const spaceToT = ts.replace(' ', 'T');
  const d3 = new Date(spaceToT);
  if (!isNaN(d3.getTime())) return d3;

  // Give up
  return null;
}

export function toLocaleTime(ts: string | undefined | null, options?: Intl.DateTimeFormatOptions) {
  const d = parseToDate(ts);
  if (!d || isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], options);
}

export function toLocaleDate(ts: string | undefined | null, options?: Intl.DateTimeFormatOptions) {
  const d = parseToDate(ts);
  if (!d || isNaN(d.getTime())) return '';
  return d.toLocaleDateString([], options);
} 
