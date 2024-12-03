import { config } from "dotenv"

config({
  path: process.cwd() + "/src/config/.env"
})

export const getEnv = (key: string, d: string | number) => {
  return process.env[key] ?? d
}