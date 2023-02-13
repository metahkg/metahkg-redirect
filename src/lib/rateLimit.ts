import { sha256 } from "./hash";
import { redis } from "./redis";

export async function rateLimit(
  ip: string,
  /** in seconds */
  timeout = 30,
  max?: number
): Promise<number> {
  const hashedIp = sha256(ip);
  const redisKey = `rate-limit-${hashedIp}`;
  const rate = Number((await redis.get(redisKey).catch(console.error)) || 0);
  if (rate) {
    if (!(max && rate >= max)) {
      await redis.incr(redisKey).catch(console.error);
    }
    return rate;
  } else {
    await redis.set(redisKey, 1, "EX", timeout).catch(console.error);
    return 1;
  }
}
