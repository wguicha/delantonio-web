/**
 * Validates Spanish phone numbers.
 * Spanish mobile numbers start with 6 or 7, landlines with 9.
 * Format: 9 digits, optionally prefixed with +34 or 0034
 */
export function normalizeSpanishPhone(phone: string): string | null {
  // Remove spaces, dashes, dots
  const cleaned = phone.replace(/[\s\-\.]/g, '');

  // Remove country code prefix if present
  const withoutPrefix = cleaned.replace(/^(\+34|0034)/, '');

  // Must be exactly 9 digits
  if (!/^\d{9}$/.test(withoutPrefix)) return null;

  // Must start with 6, 7 (mobile) or 9 (landline)
  if (!/^[679]/.test(withoutPrefix)) return null;

  // Return normalized with country code
  return `34${withoutPrefix}`;
}

export function isValidSpanishPhone(phone: string): boolean {
  return normalizeSpanishPhone(phone) !== null;
}
