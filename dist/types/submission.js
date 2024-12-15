"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionZod = void 0;
const zod_1 = require("zod");
exports.SubmissionZod = zod_1.z.object({
    attendeeId: zod_1.z.string(),
    examId: zod_1.z.string(),
    response: zod_1.z.array(zod_1.z.object({
        questionId: zod_1.z.string(),
        choiceIndex: zod_1.z.number().min(1).max(6)
    }))
});
