import { NextFunction, Request, Response } from "express";
import { ExamAnalyticsStore } from "../db/store/cache";

export const examAnalyticsStore = (req: Request, _: Response, next: NextFunction) => {
  const c = new ExamAnalyticsStore()

  req.exam_sts_store = c

  return next()
}
