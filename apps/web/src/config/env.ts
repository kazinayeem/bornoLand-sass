export const env = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "BornoSoftNR",

  ROOT_DOMAIN: process.env.ROOT_DOMAIN ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornosoftnr.site",
  NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornosoftnr.site",

  PROTOCOL: process.env.NEXT_PUBLIC_PROTOCOL ?? "https",

  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornosoftnr.site"}`,
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  ASSET_URL: process.env.NEXT_PUBLIC_ASSET_URL ?? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornosoftnr.site"}`,
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL ?? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornosoftnr.site"}`,

  API_SERVER_URL: process.env.API_URL ?? "http://localhost:4000",

  DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "BDT",
  DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "en",

  ENABLE_SUBDOMAIN: process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN === "true",
  ENABLE_AI: process.env.NEXT_PUBLIC_ENABLE_AI === "true",
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  ENABLE_BUILDER: process.env.NEXT_PUBLIC_ENABLE_BUILDER === "true",

  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",

  WILDCARD_DOMAIN: process.env.WILDCARD_DOMAIN ?? "",
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "bornoland.session",
  JWT_SECRET: process.env.JWT_SECRET ?? "",

  APP_PORT: process.env.NEXT_PUBLIC_APP_PORT ?? "3002",
  API_PORT: process.env.NEXT_PUBLIC_API_PORT ?? "4000",

  NODE_ENV: process.env.NODE_ENV ?? "development",

  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: process.env.SMTP_PORT ?? "587",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  EMAIL_FROM: process.env.EMAIL_FROM ?? "BornoSoftNR <no-reply@bornosoftnr.site>",

  get isDev() {
    return this.NODE_ENV === "development";
  },

  get isProd() {
    return this.NODE_ENV === "production";
  },
} as const;
