import hash from "hash.js";

/**
 * @description sha1
 * @param {string} str - string to hash
 */
export function sha1(str: string) {
  return hash.sha1().update(str).digest("hex");
}

/**
 * @description sha256
 * @param {string} str - string to hash
 */
export function sha256(str: string) {
  return hash.sha256().update(str).digest("hex");
}

/**
 * @description sha512
 * @param {string} str - string to hash
 */
export function sha512(str: string) {
  return hash.sha512().update(str).digest("hex");
}
