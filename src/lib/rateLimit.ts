import { sha256 } from "./hash";
import { redis } from "./redis";

export async function rateLimit(ip: string): Promise<number> {
  const hashedIp = sha256(ip);
  const redisKey = `rate-limit-${hashedIp}`;
  const rate = Number((await redis.get(redisKey)) || 0);
  if (rate) {
    await redis.incr(redisKey);
    return rate;
  } else {
    await redis.set(redisKey, 1, "EX", 30);
    return 1;
  }
}
