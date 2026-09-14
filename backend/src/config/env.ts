import "dotenv/config";

const string = (key: string, fallback: string) => {
  const value = process.env[key];
  if (!value) return fallback;
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(string("PORT", "4000")),
  FRONTEND_URL: string("FRONTEND_URL", "http://localhost:3000"),
} as const;