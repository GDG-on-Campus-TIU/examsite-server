"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionZOD = void 0;
const zod_1 = require("zod");
exports.QuestionZOD = zod_1.z.object({
    question: zod_1.z.string(),
    choices: zod_1.z.array(zod_1.z.object({
        index: zod_1.z.number().min(1).max(6),
        choice: zod_1.z.string(),
    })),
    rightChoice: zod_1.z.object({
        index: zod_1.z.number().min(1).max(6),
        // choice: z.string(),
    }),
    examId: zod_1.z.string(),
});
