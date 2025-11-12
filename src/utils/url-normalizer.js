/**
 * URL Normalization Utility
 *
 * Normalizes URLs to ensure consistent grouping of similar sources.
 * Handles both URL strings and non-URL strings gracefully.
 */

/**
 * Normalizes a URL or string for consistent comparison and grouping
 *
 * @param {string} url - The URL or string to normalize
 * @returns {string} - The normalized string
 *
 * Normalization steps:
 * 1. Remove protocol (http://, https://)
 * 2. Remove www prefix
 * 3. Convert to lowercase
 * 4. Remove trailing slashes
 * 5. Handle non-URL strings gracefully (return as-is after basic normalization)
 */
function normalizeUrl(url) {
  // Handle null, undefined, or empty strings
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Trim whitespace
  let normalized = url.trim();

  // Return empty string if nothing left after trim
  if (normalized === '') {
    return '';
  }

  // Remove protocol (http:// or https://)
  normalized = normalized.replace(/^https?:\/\//i, '');

  // Remove www prefix
  normalized = normalized.replace(/^www\./i, '');

  // Convert to lowercase
  normalized = normalized.toLowerCase();

  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '');

  return normalized;
}

module.exports = {
  normalizeUrl,
};
