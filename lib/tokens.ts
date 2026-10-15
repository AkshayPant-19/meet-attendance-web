import crypto from "node:crypto";

/** SHA-256 hash for API tokens (we store only the hash, never the token). */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Generate a new opaque API token. */
export function generateToken(): string {
  return "ma_" + crypto.randomBytes(24).toString("hex");
}
