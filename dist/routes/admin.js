"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const config_1 = require("../config");
const hash_1 = require("../utils/hash");
const attendee_1 = require("../db/models/attendee");
const mailer_1 = require("../utils/mailer");
const question_1 = require("../db/models/question");
const question_2 = require("../types/question");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.post("/create-user", async (req, res) => {
    const { name, email, dept, section } = req.body;
    if (!req.admin_access) {
        res.status(401).json({
            message: "Unauthorized access is denied!!",
        });
        return;
    }
    if (!name || !email || !dept || !section) {
        res.status(402).json({ message: "You are missing some of the fields" });
        return;
    }
    const isExists = await attendee_1.Attendee.findOne({ email });
    if (isExists) {
        res.status(400).json({
            message: "User with this email already exists",
        });
        return;
    }
    let password;
    try {
        password = (0, hash_1.generatePassword)(email, 8);
    }
    catch (e) {
        config_1.log.error("Error generating the password");
        res.status(501).json({
            message: "Oops! It seems that something is wrong from our end",
        });
        return;
    }
    config_1.log.info(`Generated password is ${password}`);
    const user = new attendee_1.Attendee({
        email,
        name,
        password,
        attempts: 2,
        dept,
        section,
    });
    try {
        await user.save();
    }
    catch (error) {
        res.status(500).json({
            message: "Error saving the user details on the database",
        });
    }
    config_1.log.info(`Sending attendee creds in their email - ${user.email}`);
    try {
        await mailer_1.transport.sendMail({
            to: user.email,
            html: `
      <h1>Thanks for registering yourself for the exam</h1>
      <br>
      <h2>Here is your credentials to login on the portal</h1>
      <div>
        <span style="color: blue;">Email</span>: <span>${user.email}</span>
        <span style="color: blue;">Password</span>: <span>${password}</span>
      </div>
      <br>
      <h2>Do not share these with anyone, Thank you.</h2>
      `,
        });
    }
    catch (e) {
        config_1.log.error(`Error sending mail to - ${user.email}`);
    }
    res.status(200).json({
        message: "Successfully registered attendee with these details",
        user,
    });
});
exports.adminRouter.post("/create-exam", async (req, res) => {
    const { name, dept, iteration, mainSubject, subTopics, totalMarks, marksPerQuestion, } = req.body;
    if (!name ||
        !dept ||
        !iteration ||
        !mainSubject ||
        !totalMarks ||
        !marksPerQuestion) {
        res.status(401).json({
            message: "You may have missed couple of fields, please provide all of the fields",
        });
        return;
    }
    const safeName = name.replace("-", "_");
    const specialCharRegex = /[^\w\s]/g;
    if (specialCharRegex.test(safeName)) {
        res.status(403).json({
            message: "No special characters (except ' ' and '_') are allowed on the exam name",
        });
        return;
    }
    const slug = safeName
        .replace("_", " ")
        .toLowerCase()
        .split(" ")
        .join("_");
    const isExists = await question_1.Exam.findOne({ dept });
    if (isExists) {
        res.status(400).json({
            message: `Exam with dept {${dept}} already exists, try renaming the exam`,
        });
        return;
    }
    const exam = new question_1.Exam({
        name,
        slug,
        mainSubject,
        iteration,
        dept,
        subTopics,
        totalMarks,
        marksPerQuestion,
        started: "NO",
        start_date: new Date(),
    });
    config_1.log.warn(`New exam created with the name - ${name}`);
    try {
        await exam.save();
        config_1.log.info(`Successfully created exam with the name - ${name} @ ${exam._id}`);
    }
    catch (e) {
        config_1.log.error(`Error saving the exam into the db - ${name} @ ${exam._id}`);
    }
    res.status(200).json({
        message: `Created exam - ${name} @ ${exam._id}`,
        exam,
        info: "Use this id for associating the questions for this exam",
    });
});
exports.adminRouter.get("/get-exams/:batch", async (req, res) => {
    console.log("searching for " + req.params.batch);
    const exam = await question_1.Exam.findOne({
        dept: req.params.batch,
    });
    // Exam.find({}).then((res) => console.log(res));
    if (!exam) {
        res.json({
            message: "no exams found for this batch",
            found: false,
        });
        return;
    }
    res.json({
        message: "found exam",
        found: true,
        exam: exam,
    });
});
exports.adminRouter.post("/create-question", async (req, res) => {
    if (!req.admin_access) {
        res.status(401).json({
            message: "Unauthorized!",
        });
        return;
    }
    let parsedQuestion;
    try {
        parsedQuestion = question_2.QuestionZOD.parse({ ...req.body });
    }
    catch (e) {
        config_1.log.warn("Error creating question");
        config_1.log.error(e.stack);
        res.status(403).json({
            message: "You are missing some fields or atleast they are invalid",
        });
        return;
    }
    try {
        const isExamExists = await question_1.Exam.findById(parsedQuestion.examId);
        if (!isExamExists) {
            config_1.log.error(`No exam found with the id - ${parsedQuestion.examId}`);
            res.status(403).json({
                message: `No exam with id - ${parsedQuestion.examId} exists!`,
            });
            return;
        }
    }
    catch (e) {
        config_1.log.warn("Error finding the exam");
        config_1.log.error(e.stack);
        res.status(403).json({
            message: "This is not a valid exam id",
        });
        return;
    }
    const question = new question_1.Question({ ...parsedQuestion });
    config_1.log.warn(`Creating question with question id - ${question._id} & exam id - ${question.examId}`);
    try {
        await question.save();
    }
    catch (e) {
        config_1.log.warn("Error saving question");
        config_1.log.error(e.stack);
        res.status(403).json({
            message: "Error saving the question to the DB",
        });
        return;
    }
    config_1.log.debug(`Created question with question id - ${question._id} & exam id - ${question.examId}`);
    res.status(201).json({
        message: "Created the question!",
        question,
    });
});
exports.adminRouter.get("/get-questions/:id", async (req, res) => {
    const id = req.params.id;
    const questions = await question_1.Question.find({ examId: id });
    if (questions) {
        res.json({
            questions: questions,
        });
    }
});
exports.adminRouter.post("/increase-attempts/:user_id", async (req, res) => {
    const { user_id } = req.params;
    const { amt } = req.body;
    if (!amt || typeof amt !== "number") {
        res.status(401).json({
            message: "Amount is required in number format",
        });
        return;
    }
    if (!user_id) {
        res.status(402).json({
            message: "User id is required - /increase-attempts/<user_id>",
        });
        return;
    }
    let attendee;
    try {
        attendee = await attendee_1.Attendee.findById(user_id);
        if (!attendee) {
            res.status(404).json({
                message: `No user found with the id - ${user_id}`,
            });
            return;
        }
        attendee.attempts += amt;
        await attendee.save();
        res.status(200).json({
            message: "Success!",
            attendee,
        });
        return;
    }
    catch (e) {
        config_1.log.error(e.stack);
        res.status(401).json({
            message: "Either the id is invalid or the max number of attempts have been reached",
        });
        return;
    }
});
