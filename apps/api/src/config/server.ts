import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const nodeEnv = process.env.NODE_ENV ?? "development";
const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), `.env.${nodeEnv}`),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), "../../.env.local"),
  path.resolve(process.cwd(), `../../.env.${nodeEnv}`),
];

for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
  }
}

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }

  return value;
}

export const serverConfig = {
  NODE_ENV: nodeEnv,
  PORT: Number(process.env.PORT ?? 5000),

  APP_NAME: requiredEnv("APP_NAME", process.env.APP_NAME ?? process.env.NEXT_PUBLIC_APP_NAME),
  PROTOCOL: requiredEnv("PROTOCOL", process.env.PROTOCOL ?? process.env.NEXT_PUBLIC_PROTOCOL),

  ROOT_DOMAIN: requiredEnv("ROOT_DOMAIN", process.env.ROOT_DOMAIN ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN),
  WILDCARD_DOMAIN: process.env.WILDCARD_DOMAIN ?? "",

  APP_URL: requiredEnv("APP_URL", process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL),
  API_URL: requiredEnv("API_URL", process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL),
  FRONTEND_URL: requiredEnv("FRONTEND_URL", process.env.FRONTEND_URL ?? process.env.WEB_URL ?? process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL),

  MONGO_URI: requiredEnv("MONGO_URI", process.env.MONGO_URI ?? process.env.MONGODB_URI),
  MONGODB_DB: process.env.MONGODB_DB ?? "bornoland",

  JWT_SECRET: requiredEnv("JWT_SECRET", process.env.JWT_SECRET),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",

  COOKIE_SECRET: requiredEnv("COOKIE_SECRET", process.env.COOKIE_SECRET ?? process.env.NEXTAUTH_SECRET),
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? `${(process.env.APP_NAME ?? process.env.NEXT_PUBLIC_APP_NAME ?? "bornoland").toLowerCase().replace(/\s+/g, "-")}.session`,

  CORS_ORIGINS: process.env.CORS_ORIGINS ?? "",

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI ?? `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ""}/auth/google/callback`,

  REDIS_URL: process.env.REDIS_URL ?? "",
  REDIS_TOKEN: process.env.REDIS_TOKEN ?? "",

  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  EMAIL_FROM: process.env.EMAIL_FROM ?? `${process.env.APP_NAME ?? process.env.NEXT_PUBLIC_APP_NAME ?? "BornoSoftNR"} <no-reply@${process.env.ROOT_DOMAIN ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN}>`,

  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY ?? "",
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY ?? "",
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME ?? "",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  SSL_COMMERZ_STORE_ID: process.env.SSL_COMMERZ_STORE_ID ?? "",
  SSL_COMMERZ_STORE_PASSWORD: process.env.SSL_COMMERZ_STORE_PASSWORD ?? "",

  get isDev() {
    return this.NODE_ENV === "development";
  },

  get isProd() {
    return this.NODE_ENV === "production";
  },

  get protocol() {
    return this.isDev ? "http" : "https";
  },
};
