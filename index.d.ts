import { ExamAnalyticsStore } from "./src/db/store/cache";

declare global {
  namespace Express {
    interface Request {
      admin_access: boolean;
      userId: string;
      exam_sts_store: ExamAnalyticsStore;
    }
  }
}
