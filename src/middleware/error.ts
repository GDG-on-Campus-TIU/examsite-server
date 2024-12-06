import { NextFunction, Request, Response } from "express";
import { log } from "../config";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.error(err.stack);
  next({ message: err.message });
};
