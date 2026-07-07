const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export function isValidObjectId(value: string): boolean {
  return OBJECT_ID_REGEX.test(value);
}

export function requireObjectId(value: string, name = "id"): { ok: true; value: string } | { ok: false; message: string } {
  if (!value) return { ok: false, message: `${name} is required` };
  if (!isValidObjectId(value)) return { ok: false, message: `Invalid ${name}: must be a 24-character hex string` };
  return { ok: true, value };
}
