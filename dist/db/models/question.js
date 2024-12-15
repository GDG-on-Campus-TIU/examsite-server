"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exam = exports.Question = exports.QuestionSchema = exports.AnswerSchema = exports.ChoiceSchema = exports.ExamSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ExamSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Exam name is required"],
    },
    slug: {
        type: String,
        required: [true, "Slug is required!"],
        unique: true,
    },
    dept: {
        type: String,
        required: false,
    },
    iteration: {
        type: Number,
        required: [true, "Current iteration of the exam is needed"],
    },
    subTopics: {
        type: [String],
        required: [true, "Sub topics are required"],
    },
    mainSubject: {
        type: String,
        required: [true, "Main subject is required for the exam"],
    },
    totalMarks: {
        type: Number,
        required: [true, "Total marks is required for the exam"],
    },
    marksPerQuestion: {
        type: Number,
        required: [true, "Marks per question is required for the exam"],
    },
    started: {
        type: String,
        default: "NO",
    },
    start_date: {
        type: Date,
        default: Date.now,
        required: true,
    },
});
exports.ChoiceSchema = new mongoose_1.Schema({
    index: { type: Number, required: true },
    choice: { type: String, required: true },
});
exports.AnswerSchema = new mongoose_1.Schema({
    index: { type: Number, required: true },
    // choice: { type: String, required: true },
});
exports.QuestionSchema = new mongoose_1.Schema({
    question: {
        type: String,
        required: true,
    },
    choices: {
        type: [exports.ChoiceSchema],
        required: true,
        validate: {
            validator: function (choices) {
                return choices.length >= 4 && choices.length <= 6;
            },
            message: "Choices must have between 4 and 6 options.",
        },
    },
    rightChoice: {
        type: exports.AnswerSchema,
        required: true,
    },
    examId: {
        type: String,
        required: [
            true,
            "Associating the questions to a particular exam is mandatory",
        ],
    },
});
exports.Question = (0, mongoose_1.model)("Questions", exports.QuestionSchema);
exports.Exam = (0, mongoose_1.model)("Exams", exports.ExamSchema);
