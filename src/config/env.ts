import { config } from "dotenv"

config({
  path: process.cwd() + "/src/config/.env"
})

export const getEnv = <T>(key: string, d: T) => {
  return process.env[key] ?? d
}