/**
 * Parameter Normalization Utility
 *
 * Prevents type confusion vulnerabilities by ensuring HTTP parameters are strings.
 * Handles cases where malicious clients send arrays instead of expected strings.
 */

/**
 * Normalizes a parameter value to a string
 *
 * @param {*} value - The parameter value to normalize
 * @param {string} paramName - The name of the parameter (for logging)
 * @returns {string} - Normalized string value
 *
 * Behavior:
 * - If value is a string: returns as-is
 * - If value is an array: returns first element (with warning log)
 * - If value is null/undefined: returns empty string
 * - Otherwise: converts to string
 */
function normalizeParam(value, paramName = 'unknown') {
  // Already a string - return as-is
  if (typeof value === 'string') {
    return value;
  }

  // Array - take first element and log warning
  if (Array.isArray(value)) {
    console.warn(
      `[Security] Parameter tampering detected: ${paramName} sent as array. Taking first element.`
    );
    return value.length > 0 ? String(value[0]) : '';
  }

  // Null or undefined - return empty string
  if (value === null || value === undefined) {
    return '';
  }

  // Other types - convert to string
  return String(value);
}

module.exports = {
  normalizeParam,
};
