function requiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }

  return value;
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const appName = requiredEnv("NEXT_PUBLIC_APP_NAME", process.env.NEXT_PUBLIC_APP_NAME);
const publicRootDomain = requiredEnv("NEXT_PUBLIC_ROOT_DOMAIN", process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? process.env.ROOT_DOMAIN);
const protocol = requiredEnv("NEXT_PUBLIC_PROTOCOL", process.env.NEXT_PUBLIC_PROTOCOL);
const appUrl = requiredEnv("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);
const apiUrl = requiredEnv("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL);
const assetUrl = requiredEnv("NEXT_PUBLIC_ASSET_URL", process.env.NEXT_PUBLIC_ASSET_URL);
const socketUrl = requiredEnv("NEXT_PUBLIC_SOCKET_URL", process.env.NEXT_PUBLIC_SOCKET_URL);
const appPort = requiredEnv("NEXT_PUBLIC_APP_PORT", process.env.NEXT_PUBLIC_APP_PORT);
const apiPort = requiredEnv("NEXT_PUBLIC_API_PORT", process.env.NEXT_PUBLIC_API_PORT);

export const env = {
  APP_NAME: appName,

  ROOT_DOMAIN: publicRootDomain,
  NEXT_PUBLIC_ROOT_DOMAIN: publicRootDomain,

  PROTOCOL: protocol,

  APP_URL: appUrl,
  API_URL: apiUrl,
  ASSET_URL: assetUrl,
  SOCKET_URL: socketUrl,

  API_SERVER_URL: process.env.API_URL ?? apiUrl,

  DEFAULT_CURRENCY: requiredEnv("NEXT_PUBLIC_DEFAULT_CURRENCY", process.env.NEXT_PUBLIC_DEFAULT_CURRENCY),
  DEFAULT_LOCALE: requiredEnv("NEXT_PUBLIC_DEFAULT_LOCALE", process.env.NEXT_PUBLIC_DEFAULT_LOCALE),

  ENABLE_SUBDOMAIN: process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN === "true",
  ENABLE_AI: process.env.NEXT_PUBLIC_ENABLE_AI === "true",
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  ENABLE_BUILDER: process.env.NEXT_PUBLIC_ENABLE_BUILDER === "true",

  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",

  WILDCARD_DOMAIN: process.env.WILDCARD_DOMAIN ?? "",
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? `${appName.toLowerCase().replace(/\s+/g, "-")}.session`,
  JWT_SECRET: process.env.JWT_SECRET ?? "",

  APP_PORT: appPort,
  API_PORT: apiPort,

  NODE_ENV: nodeEnv,

  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: process.env.SMTP_PORT ?? "587",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  EMAIL_FROM: process.env.EMAIL_FROM ?? `${appName} <no-reply@${publicRootDomain}>>`.replace(/>>$/, ">").replace(/\s+/g, " "),

  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? appUrl,

  get isDev() {
    return this.NODE_ENV === "development";
  },

  get isProd() {
    return this.NODE_ENV === "production";
  },
} as const;
