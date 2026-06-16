// src/config/api.ts

// 1. Apne saare environments yahan define karein
const API_URLS = {
  development: "http://localhost:5000",
  production: "https://your-live-backend-api.com", // 👈 Jab backend deploy karo to yahan live URL daal dena
};

// 2. Current environment detect karein (Next.js automatically isko set rakhta hai)
const currentEnv = process.env.NODE_ENV || "development";

// 3. Simple case / mapping match kar ke base URL nikalien
export const API_BASE_URL = API_URLS[currentEnv as keyof typeof API_URLS] || API_URLS.development;