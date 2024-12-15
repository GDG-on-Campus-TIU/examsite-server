"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionRouter = void 0;
const express_1 = require("express");
const question_1 = require("../db/models/question");
const config_1 = require("../config");
const status_1 = require("../types/status");
const questionRouter = (0, express_1.Router)();
exports.questionRouter = questionRouter;
questionRouter.get("/get-all/:examId", async (req, res) => {
    const { examId } = req.params;
    if (!examId) {
        res.status(403).json({
            message: "Please provide the exam id - /get-all/<exam-id>"
        });
        return;
    }
    if (!req.admin_access && !req.userId) {
        res.status(401).json({
            message: "Unauthorized!"
        });
        return;
    }
    let exam;
    try {
        exam = await question_1.Exam.findById(examId);
        if (!exam) {
            res.status(404).json({
                message: `No exam found with the id - ${examId}`
            });
            return;
        }
        if (exam.started !== "YES") {
            res.status(404).json({
                message: "The exam is not started yet"
            });
            return;
        }
    }
    catch (e) {
        config_1.log.warn(`Trying to access invalid exam with id - ${examId}`);
        res.status(403).json({
            message: `Exam id is invalid - ${examId}`
        });
        return;
    }
    if (!exam) {
        res.status(403).json({
            message: `No exam exists with id - ${examId}`
        });
        return;
    }
    try {
        const questions = await question_1.Question.find({ examId });
        if (questions.length === 0) {
            res.status(403).json({
                message: `There are no questions published for this exam yet, exam - ${examId}`
            });
            return;
        }
        req.exam_sts_store.updateKey(req.userId, status_1.ExamStatusCache.IN_PROGRESS);
        res.status(200).json({
            questions
        });
        return;
    }
    catch (e) {
        config_1.log.error("Error fetching the questions");
        config_1.log.error(e);
        config_1.log.error(e.stack);
        res.status(401).json({
            message: "Either exam with this id does not exist or you may have entered that wrong!"
        });
        return;
    }
});
