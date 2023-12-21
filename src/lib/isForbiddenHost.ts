import dns from "dns";
import isLocalhost from "is-localhost-ip";

/**
 * @description Check if the hostname is forbidden (local or private)
 * @param {string} hostname - The hostname to check.
 */
export async function isForbiddenHost(
  hostname: string,
): Promise<boolean | null> {
  try {
    const ips: string[] = await new Promise((resolve, reject) =>
      dns.resolve(hostname, (err, ips) => (err ? reject(err) : resolve(ips))),
    );
    if ((await Promise.all(ips.map((ip) => isLocalhost(ip)))).some(Boolean)) {
      return true;
    }
    return false;
  } catch {
    return null;
  }
}
