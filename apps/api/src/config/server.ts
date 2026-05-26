import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

export const serverConfig = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),

  ROOT_DOMAIN: process.env.ROOT_DOMAIN ?? "bornosoftnr.site",
  WILDCARD_DOMAIN: process.env.WILDCARD_DOMAIN ?? "",

  APP_URL: process.env.APP_URL ?? "http://localhost:3002",
  API_URL: process.env.API_URL ?? "http://localhost:4000",
  FRONTEND_URL: process.env.FRONTEND_URL ?? process.env.WEB_URL ?? "http://localhost:3002",

  MONGO_URI: process.env.MONGO_URI ?? process.env.MONGODB_URI ?? "",
  MONGODB_DB: process.env.MONGODB_DB ?? "bornoland",

  JWT_SECRET: process.env.JWT_SECRET ?? "",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",

  COOKIE_SECRET: process.env.COOKIE_SECRET ?? "",
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "bornoland.session",

  CORS_ORIGINS: process.env.CORS_ORIGINS ?? "",

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI ?? "",

  REDIS_URL: process.env.REDIS_URL ?? "",
  REDIS_TOKEN: process.env.REDIS_TOKEN ?? "",

  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  EMAIL_FROM: process.env.EMAIL_FROM ?? "BornoSoftNR <no-reply@bornosoftnr.site>",

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
