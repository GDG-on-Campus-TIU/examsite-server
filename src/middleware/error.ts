import { NextFunction, Request, Response } from "express";
import { log } from "../config";

export const errorHandler = (
  err: Error,
  _: Request,
  __: Response,
  next: NextFunction
) => {
  log.error(err.stack);
  next({ message: err.message });
};
