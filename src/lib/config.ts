import dotenv from "dotenv";

dotenv.config();

export const config = {
    SAFEBROWSING_API_KEY: process.env.SAFEBROWSING_API_KEY || "",
    REDIS_HOST: process.env.REDIS_HOST || "localhost",
    REDIS_PORT: Number(process.env.REDIS_PORT || 6379) || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
    TRUST_PROXY: JSON.parse(process.env.TRUST_PROXY || "true") ?? true,
}