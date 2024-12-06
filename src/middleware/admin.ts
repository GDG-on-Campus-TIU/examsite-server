import { NextFunction, Request, Response } from "express";
import { getEnv } from "../config";
import { log } from "../config";

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { a_email, a_pass } = req.query

  const ADMIN_EMAIL = getEnv<string>("ADMIN_USER", "admin@gmail.com")
  const ADMIN_PASSWORD = getEnv<string>("ADMIN_PASSWORD", "password")

  if (!a_email || !a_pass) {
    res
      .status(402)
      .json({ message: "ADMIN CREDENTIALS REQUIRED THROUGH QUERY STRING" })
    return
  }

  if (a_email !== ADMIN_EMAIL || a_pass !== ADMIN_PASSWORD) {
    log.error("Unauthorized entry!!!")
    res
      .status(401)
      .json({ message: "UAUTHORIZED ACCESS WITHOUT ADMIN PERMISSION" })
    return
  }

  req.admin_access = true
  next()
}
