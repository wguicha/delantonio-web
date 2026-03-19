/**
 * Validates and normalizes international phone numbers.
 * Accepts any number with country code (e.g. +34612345678, 34612345678, +351912345678)
 * Minimum 7 digits, maximum 15 digits (ITU-T E.164)
 */
export function normalizePhone(phone: string): string | null {
  // Remove spaces, dashes, dots, parentheses
  const cleaned = phone.replace(/[\s\-\.\(\)]/g, '');

  // Remove leading +
  const withoutPlus = cleaned.replace(/^\+/, '');

  // Must be only digits now
  if (!/^\d+$/.test(withoutPlus)) return null;

  // E.164: 7 to 15 digits
  if (withoutPlus.length < 7 || withoutPlus.length > 15) return null;

  return withoutPlus;
}

export function isValidPhone(phone: string): boolean {
  return normalizePhone(phone) !== null;
}

// Legacy aliases kept for backwards compatibility
export const normalizeSpanishPhone = normalizePhone;
export const isValidSpanishPhone = isValidPhone;
