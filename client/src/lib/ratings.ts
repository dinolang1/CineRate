/**
 * Convert from 0.5-5.0 scale to 1-50 internal storage scale
 * Examples: 0.5 -> 1, 1.0 -> 2, 2.5 -> 5, 5.0 -> 10
 */
export function convertRatingToStorage(rating: number): number {
  return Math.round(rating * 10);
}

/**
 * Convert from 1-50 internal storage scale to 0.5-5.0 display scale
 * Examples: 1 -> 0.5, 2 -> 1.0, 5 -> 2.5, 10 -> 5.0
 */
export function convertRatingFromStorage(storageRating: number): number {
  return storageRating / 10;
}

/**
 * Convert legacy 1-10 scale to new 0.5-5.0 scale
 * Examples: 1 -> 0.5, 5 -> 2.5, 10 -> 5.0
 */
export function convertLegacyRating(legacyRating: number): number {
  return legacyRating / 2;
}

/**
 * Convert movie average rating from 1-100 scale to 0.5-5.0 scale
 * Examples: 84 -> 4.2, 90 -> 4.5
 */
export function convertMovieRating(movieRating: number | null): number {
  if (!movieRating) return 0;
  return movieRating / 20;
}

/**
 * Format rating for display with proper decimal places
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Get available rating options for dropdown/selection
 */
export function getRatingOptions(): Array<{ value: number; label: string }> {
  const options = [];
  for (let i = 0.5; i <= 5; i += 0.5) {
    options.push({
      value: convertRatingToStorage(i),
      label: formatRating(i)
    });
  }
  return options;
}
