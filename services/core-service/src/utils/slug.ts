/**
 * Slug generation utility for Company names.
 *
 * Converts "Google LLC" → "google-llc"
 * Converts "Meta (Facebook)" → "meta-facebook"
 */

/**
 * Generates a URL-safe slug from an arbitrary string.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")   // remove non-alphanumeric (keep spaces and hyphens)
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-+/g, "-")             // collapse multiple hyphens
    .replace(/^-+|-+$/g, "");        // strip leading/trailing hyphens
}

/**
 * Appends a numeric suffix to make a slug unique.
 * Example: "google" → "google-2", "google-3", etc.
 */
export function appendSlugSuffix(slug: string, suffix: number): string {
  return `${slug}-${suffix}`;
}
