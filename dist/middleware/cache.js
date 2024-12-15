"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examAnalyticsStore = void 0;
const cache_1 = require("../db/store/cache");
const examAnalyticsStore = (req, _, next) => {
    const c = new cache_1.ExamAnalyticsStore();
    req.exam_sts_store = c;
    return next();
};
exports.examAnalyticsStore = examAnalyticsStore;
