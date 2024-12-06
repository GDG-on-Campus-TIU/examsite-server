import { createHmac } from "crypto"
import { getEnv, log } from "../config";

/**
 * Generates a deterministic hash-based password for a given email.
 * @param email - The email address for which to generate the password.
 * @param length - Optional length to truncate the hash for usability.
 * @returns A hashed string to be used as a temporary password.
 */
export function generatePassword(email: string, length?: number): string {
  if (!email) {
    throw new Error("Email is required to generate a password.");
  }

  const SECRET_KEY = getEnv<string>("HASH_KEY", "SECRET_KEY_FOR_HASH")

  if (SECRET_KEY === "SECRET_KEY_FOR_HASH") {
    log.warn("Could'nt find the hash key so using the defaul key")
  }

  const hmac = createHmac("sha256", SECRET_KEY);
  hmac.update(email);

  const fullHash = hmac.digest("hex");

  return length ? fullHash.slice(0, length) : fullHash;
}
