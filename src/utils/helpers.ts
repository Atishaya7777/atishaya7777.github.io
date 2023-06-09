/**
 * Check for empty object
 * @param {Object} value Object
 * @returns {Boolean}
 */
export function isEmptyObject(obj: { [key: string]: unknown }) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
