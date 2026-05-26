const rawEnv = process.env;

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }

  return value;
}

const nodeEnv = rawEnv.NODE_ENV ?? "development";
const appName = requiredEnv("NEXT_PUBLIC_APP_NAME", rawEnv.NEXT_PUBLIC_APP_NAME);
const publicRootDomain = requiredEnv("NEXT_PUBLIC_ROOT_DOMAIN", rawEnv.NEXT_PUBLIC_ROOT_DOMAIN ?? rawEnv.ROOT_DOMAIN);
const protocol = requiredEnv("NEXT_PUBLIC_PROTOCOL", rawEnv.NEXT_PUBLIC_PROTOCOL);
const appUrl = requiredEnv("NEXT_PUBLIC_APP_URL", rawEnv.NEXT_PUBLIC_APP_URL);
const apiUrl = requiredEnv("NEXT_PUBLIC_API_URL", rawEnv.NEXT_PUBLIC_API_URL);
const assetUrl = requiredEnv("NEXT_PUBLIC_ASSET_URL", rawEnv.NEXT_PUBLIC_ASSET_URL);
const socketUrl = requiredEnv("NEXT_PUBLIC_SOCKET_URL", rawEnv.NEXT_PUBLIC_SOCKET_URL);
const appPort = requiredEnv("NEXT_PUBLIC_APP_PORT", rawEnv.NEXT_PUBLIC_APP_PORT);
const apiPort = requiredEnv("NEXT_PUBLIC_API_PORT", rawEnv.NEXT_PUBLIC_API_PORT);

export const env = {
  APP_NAME: appName,

  ROOT_DOMAIN: publicRootDomain,
  NEXT_PUBLIC_ROOT_DOMAIN: publicRootDomain,

  PROTOCOL: protocol,

  APP_URL: appUrl,
  API_URL: apiUrl,
  ASSET_URL: assetUrl,
  SOCKET_URL: socketUrl,

  API_SERVER_URL: rawEnv.API_URL ?? apiUrl,

  DEFAULT_CURRENCY: requiredEnv("NEXT_PUBLIC_DEFAULT_CURRENCY", rawEnv.NEXT_PUBLIC_DEFAULT_CURRENCY),
  DEFAULT_LOCALE: requiredEnv("NEXT_PUBLIC_DEFAULT_LOCALE", rawEnv.NEXT_PUBLIC_DEFAULT_LOCALE),

  ENABLE_SUBDOMAIN: rawEnv.NEXT_PUBLIC_ENABLE_SUBDOMAIN === "true",
  ENABLE_AI: rawEnv.NEXT_PUBLIC_ENABLE_AI === "true",
  ENABLE_ANALYTICS: rawEnv.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  ENABLE_BUILDER: rawEnv.NEXT_PUBLIC_ENABLE_BUILDER === "true",

  GOOGLE_CLIENT_ID: rawEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",

  WILDCARD_DOMAIN: rawEnv.WILDCARD_DOMAIN ?? "",
  SESSION_COOKIE_NAME: rawEnv.SESSION_COOKIE_NAME ?? `${appName.toLowerCase().replace(/\s+/g, "-")}.session`,
  JWT_SECRET: rawEnv.JWT_SECRET ?? "",

  APP_PORT: appPort,
  API_PORT: apiPort,

  NODE_ENV: nodeEnv,

  SMTP_HOST: rawEnv.SMTP_HOST ?? "",
  SMTP_PORT: rawEnv.SMTP_PORT ?? "587",
  SMTP_USER: rawEnv.SMTP_USER ?? "",
  SMTP_PASS: rawEnv.SMTP_PASS ?? "",
  EMAIL_FROM: rawEnv.EMAIL_FROM ?? `${appName} <no-reply@${publicRootDomain}>>`.replace(/>>$/, ">").replace(/\s+/g, " "),

  NEXTAUTH_URL: rawEnv.NEXTAUTH_URL ?? appUrl,

  get isDev() {
    return this.NODE_ENV === "development";
  },

  get isProd() {
    return this.NODE_ENV === "production";
  },
} as const;
