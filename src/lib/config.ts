import dotenv from "dotenv";
import { getHMACKey } from "./hmac";

dotenv.config();

export const config = {
  SAFEBROWSING_API_KEY: process.env.SAFEBROWSING_API_KEY || "",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: Number(process.env.REDIS_PORT || 6379) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
  TRUST_PROXY: JSON.parse(process.env.TRUST_PROXY || "true") ?? true,
  HMAC_KEY: getHMACKey(),
  HMAC_VERIFY: JSON.parse(process.env.HMAC_VERIFY || "false") ?? false,
};
