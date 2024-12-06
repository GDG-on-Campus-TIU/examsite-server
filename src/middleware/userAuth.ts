import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { getEnv } from "../config";

export const userAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  const { a_email, a_pass } = req.query

  const ADMIN_EMAIL = getEnv<string>("ADMIN_USER", "admin@gmail.com")
  const ADMIN_PASSWORD = getEnv<string>("ADMIN_PASSWORD", "password")

  if (a_email === ADMIN_EMAIL && a_pass === ADMIN_PASSWORD) {
    req.admin_access = true
    next()
    return
  }

  if (!token) {
    res.status(401).json({ message: "No token, authorization denied" });
    return
  }
  try {
    const decoded = verify(token, getEnv("JWT_SECRET", "secret__key")) as JwtPayload & { userId: string; attempts: number; email: string };
    req.userId = decoded.userId;
    next();
    return
  } catch (err) {
    res.status(403).json({ message: "Token is not valid" });
    return
  }
};
