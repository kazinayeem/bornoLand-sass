type ChangeEntry = { field: string; oldValue: unknown; newValue: unknown };

export function optionalObjectId(value: unknown): string | undefined {
  if (value == null) return undefined;
  const id = String(value).trim();
  return id.length > 0 ? id : undefined;
}

export function computeChanges(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
  fields?: string[],
): ChangeEntry[] {
  if (!before && !after) return [];
  const keys = fields ?? Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]));
  const changes: ChangeEntry[] = [];

  for (const field of keys) {
    const oldValue = before?.[field];
    const newValue = after?.[field];
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;
    changes.push({ field, oldValue, newValue });
  }

  return changes;
}

export function parseUserAgent(userAgent?: string) {
  const ua = userAgent ?? "";
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  if (/mobile|android|iphone|ipad/i.test(ua)) device = "Mobile";
  else if (/tablet|ipad/i.test(ua)) device = "Tablet";

  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome\//i.test(ua)) browser = "Chrome";
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox\//i.test(ua)) browser = "Firefox";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { browser, os, device };
}

export function getClientIp(request: { ip?: string; headers?: Record<string, string | string[] | undefined> }) {
  const forwarded = request.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "";
  }
  return request.ip ?? "";
}

export function buildDescription(action: string, entityName?: string, changes?: ChangeEntry[]) {
  const label = entityName ? ` ${entityName}` : "";
  if (changes?.length === 1) {
    const c = changes[0];
    return `${action}${label}: ${c.field} changed`;
  }
  if (changes && changes.length > 1) {
    return `${action}${label}: ${changes.length} fields updated`;
  }
  return `${action}${label}`.trim();
}
