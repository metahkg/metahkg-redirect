import dns from "dns";
import isLocalhost from "is-localhost-ip";
import isPrivateIp from "private-ip";

export async function isForbiddenHost(
  hostname: string
): Promise<boolean | null> {
  try {
    const ips: string[] = await new Promise((resolve, reject) =>
      dns.resolve(hostname, (err, ips) => (err ? reject(err) : resolve(ips)))
    );
    if (ips.some((ip) => isLocalhost(ip) || isPrivateIp(ip))) {
      return true;
    }
    return false;
  } catch {
    return null;
  }
}
