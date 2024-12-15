"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submission = exports.SubmissionSchema = void 0;
const mongoose_1 = require("mongoose");
exports.SubmissionSchema = new mongoose_1.Schema({
    attendeeId: {
        type: String,
        required: [true, "Without the attendee details can't submit the exam"],
    },
    examId: {
        type: String,
        required: [true, "Exam details is required for the submission"]
    },
    response: {
        type: [{
                questionId: {
                    type: String,
                    required: [true, "Question id is required for the answer to be associated with the right question"],
                },
                choiceIndex: {
                    type: Number,
                    required: [true, "Choice is required to be the answer evaluated of"]
                },
            }],
        required: [true, "Answers are required to fill the exam details"]
    }
});
exports.Submission = (0, mongoose_1.model)("Submissions", exports.SubmissionSchema);
