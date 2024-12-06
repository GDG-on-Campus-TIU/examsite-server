import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      admin_access: boolean;
      userId: string;
    }
  }
}
