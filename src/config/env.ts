import { config } from "dotenv";
import fs from "fs";

if (process.env.NODE_ENV !== "production") {
  config({
    path: process.cwd() + "/src/config/.env",
  });
}

export const getEnv = <T>(key: string, d: T): T | string => {
  const newKey = key.replace("_", " ").toLowerCase().replace(" ", "-")
  const secretPath = `/run/secrets/${newKey}`;
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, "utf-8").trim() as unknown as T;
  }

  return process.env[key] ?? d;
};

