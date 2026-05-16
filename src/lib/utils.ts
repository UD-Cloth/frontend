import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sprint 3 + Sprint 7: single source of truth for currency formatting.
 *
 * BUG-F-081: returning `""` on NaN was confusing — call sites embedded the
 * result in a label and showed nothing (e.g. "Total: " with no value). Now
 * NaN/undefined/null all collapse to formatted zero, which is the conservative
 * UI default and matches what every caller wants when the input is missing.
 */
export function formatPrice(
  price: number | string | null | undefined,
  opts: { currency?: string; locale?: string; fractionDigits?: number } = {}
): string {
  const raw = Number(price ?? 0);
  const value = Number.isFinite(raw) ? raw : 0;
  const { currency = "INR", locale = "en-IN", fractionDigits = 0 } = opts;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
