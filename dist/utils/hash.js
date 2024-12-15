"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePassword = generatePassword;
const crypto_1 = require("crypto");
const config_1 = require("../config");
/**
 * Generates a deterministic hash-based password for a given email.
 * @param email - The email address for which to generate the password.
 * @param length - Optional length to truncate the hash for usability.
 * @returns A hashed string to be used as a temporary password.
 */
function generatePassword(email, length) {
    if (!email) {
        throw new Error("Email is required to generate a password.");
    }
    const SECRET_KEY = (0, config_1.getEnv)("HASH_KEY", "SECRET_KEY_FOR_HASH");
    if (SECRET_KEY === "SECRET_KEY_FOR_HASH") {
        config_1.log.warn("Could'nt find the hash key so using the defaul key");
    }
    const hmac = (0, crypto_1.createHmac)("sha256", SECRET_KEY);
    hmac.update(email);
    const fullHash = hmac.digest("hex");
    return length ? fullHash.slice(0, length) : fullHash;
}
