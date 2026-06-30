export function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function getApiUrl() {
  return stripTrailingSlash(process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "");
}

export function getWebUrl() {
  return stripTrailingSlash(process.env.WEB_URL ?? process.env.APP_URL ?? "");
}

export function getRootDomain() {
  return process.env.ROOT_DOMAIN ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
}
