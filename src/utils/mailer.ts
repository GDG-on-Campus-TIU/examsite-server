import { createTransport } from "nodemailer"
import { getEnv } from "../config"

const transport = createTransport({
  service: "gmail",
  auth: {
    user: getEnv("NODEMAILER_MAIL_ID", "dev.bosepiush@gmail.com"),
    pass: getEnv("NODEMAILER_MAIL_PASS", "wlolsuibybjyvkwc")
  }
})

export { transport }
