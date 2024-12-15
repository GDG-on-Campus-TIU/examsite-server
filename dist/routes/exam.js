"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examRouter = void 0;
const express_1 = require("express");
const attendee_1 = require("../db/models/attendee");
const question_1 = require("../db/models/question");
const submission_1 = require("../db/models/submission");
const submission_2 = require("../types/submission");
const config_1 = require("../config");
const status_1 = require("../types/status");
exports.examRouter = (0, express_1.Router)();
exports.examRouter.post("/start/:exam_id", async (req, res) => {
    const { exam_id } = req.params;
    if (!exam_id) {
        res.status(404).json({
            message: "No exam id provided"
        });
        return;
    }
    if (!req.userId) {
        res.status(404).json({
            message: "Unauthorized"
        });
        return;
    }
    let exam;
    try {
        exam = await question_1.Exam.findById(exam_id);
        if (!exam) {
            res.status(404).json({
                message: `No exam found with the id - ${exam_id}`
            });
            return;
        }
    }
    catch (e) {
        config_1.log.error(`Error starting the exam - ${e.message}`);
        res.status(403).json({
            message: "Invalid id provided"
        });
        return;
    }
    if (exam.started !== "YES") {
        res.status(400).json({
            message: "Exam not started yet!"
        });
        return;
    }
    req.exam_sts_store.updateKey(req.userId, status_1.ExamStatusCache.STARTED);
    res.status(200).json({
        message: "Started the exam"
    });
});
exports.examRouter.post("/submit-exam/:exam_id", async (req, res) => {
    const { exam_id } = req.params;
    const { response } = req.body;
    if (!req.userId) {
        res.status(401).json({
            message: "Unauthorized!"
        });
        return;
    }
    if (!exam_id) {
        res.status(401).json({
            message: "No exam id provided with the request"
        });
        return;
    }
    try {
        const isAttendeeSubmissionExists = await submission_1.Submission.findOne({ attendeeId: req.userId, examId: exam_id });
        if (isAttendeeSubmissionExists) {
            res.status(400).json({
                message: "You have already exhausted your submission"
            });
            return;
        }
    }
    catch (e) {
        config_1.log.error(`Error submitting the exam - ${e.message}`);
        res.status(402).json({
            message: "Something wrong happened on our end"
        });
        return;
    }
    let attendee;
    let exam;
    try {
        attendee = await attendee_1.Attendee.findById(req.userId);
        if (!attendee) {
            res.status(404).json({
                message: `No user found with the id - ${req.userId}`
            });
            return;
        }
    }
    catch (e) {
        config_1.log.error(`Error submitting the exam - ${e.message}`);
        res.status(401).json({
            message: "Please provide a valid user id"
        });
        return;
    }
    if (!(attendee.attempts > 0)) {
        req.exam_sts_store.updateKey(req.userId, status_1.ExamStatusCache.BLOCKED);
        res.status(401).json({
            message: "You have exhausted your attempts, please contact the admins to increase your attempts"
        });
        return;
    }
    try {
        exam = await question_1.Exam.findById(exam_id);
        if (!exam) {
            res.status(404).json({
                message: `No exam found with the id - ${exam_id}`
            });
            return;
        }
    }
    catch (e) {
        config_1.log.error(`Error submitting the exam - ${e.message}`);
        res.status(401).json({
            message: "Please provide a valid exam id with the request"
        });
        return;
    }
    try {
        submission_2.SubmissionZod.parse({
            attendeeId: req.userId,
            examId: exam_id,
            response
        });
    }
    catch (e) {
        config_1.log.error("Error parsing the submission");
        res.status(402).json({
            message: "Please provide valid answer types"
        });
        return;
    }
    try {
        const submission = new submission_1.Submission({
            attendeeId: req.userId,
            examId: exam_id,
            response
        });
        await submission.save();
        req.exam_sts_store.updateKey(req.userId, status_1.ExamStatusCache.COMPLETED);
        res.status(201).json({
            message: "Successfully submitted the answers to the server",
            submission
        });
        return;
    }
    catch (e) {
        config_1.log.error("Error creating the submission with the details");
        res.status(500).json({
            message: "Something went wrong from our end."
        });
        return;
    }
});
exports.examRouter.get("/get-submissions/:student_id", async (req, res) => {
    if (!req.admin_access && !req.userId) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }
    const { student_id } = req.params;
    if (!student_id) {
        res.status(404).json({
            message: "Please provide the student id"
        });
        return;
    }
    try {
        const userExist = await attendee_1.Attendee.findById(student_id);
        if (!userExist) {
            res.status(404).json({
                message: "No user found with the provided id"
            });
            return;
        }
    }
    catch (e) {
        config_1.log.error(`Error getting the submissions - ${e.message}`);
        res.status(401).json({
            message: "Provide a valid user id"
        });
        return;
    }
    try {
        const submissions = await submission_1.Submission.find({
            attendeeId: student_id
        });
        if (!submissions) {
            res.status(404).json({
                message: "No submissions found for the user"
            });
            return;
        }
        res.status(200).json({
            message: "Success",
            submissions
        });
        return;
    }
    catch (e) {
        config_1.log.error(`Error getting the submissions - ${e.message}`);
        res.status(401).json({
            message: "Something went wrong"
        });
        return;
    }
});
