import { Request } from "express";
import { ExamAnalyticsStore } from "../db/store/cache"

export interface AuthenticatedRequest extends Request {
  admin_access: boolean
  userId: string
  exam_sts_store: ExamAnalyticsStore
}
