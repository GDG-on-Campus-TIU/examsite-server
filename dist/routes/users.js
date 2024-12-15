"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const attendee_1 = require("../db/models/attendee");
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config");
const userAuth_1 = require("../middleware/userAuth");
const status_1 = require("../types/status");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.get("/me", userAuth_1.userAuth, async (req, res) => {
    if (!req.userId && !req.admin_access) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }
    try {
        const user = await attendee_1.Attendee.findById(req.userId);
        if (!user) {
            res.status(404).json({
                message: "No users found with this is"
            });
            return;
        }
        res.status(200).json({
            user
        });
        return;
    }
    catch (e) {
        config_1.log.error(`Error finding the user - ${e.message}`);
        res.status(401).json({
            message: "Please provide a valid id"
        });
        return;
    }
});
exports.userRouter.get("/get-all", userAuth_1.userAuth, async (req, res) => {
    if (!req.userId && !req.admin_access) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }
    const users = await attendee_1.Attendee.find();
    if (users.length === 0) {
        res.status(200).json({
            message: "There are no users"
        });
        return;
    }
    res.status(200).json({
        users
    });
});
// POST verifying whether the user has right credentials or not
exports.userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        res.status(401).json({
            message: "Email is required"
        });
        return;
    }
    if (!password) {
        res.status(401).json({
            message: "Password is required"
        });
        return;
    }
    if (!(email.split("").includes("@") && email.split("").includes("."))) {
        res.status(401).json({ message: "Invalid email address" });
        return;
    }
    let userExists;
    try {
        userExists = await attendee_1.Attendee.findOne({ email });
    }
    catch (e) {
        config_1.log.error(`Error finding the user with email - ${email}`);
        res.status(501).json({
            message: "Something went wrong from our side"
        });
        return;
    }
    if (!userExists) {
        res.status(401).json({ message: "No user exists with the specified email" });
        return;
    }
    if (!(userExists.password === password.trim())) {
        res.status(401).json({ message: "Password does not match with the user" });
        return;
    }
    const jwtToken = (0, jsonwebtoken_1.sign)({
        email: userExists.email,
        attempts: userExists.attempts,
        userId: userExists._id,
    }, (0, config_1.getEnv)("JWT_SECRET", "secret__key"), {
        algorithm: "HS512",
        expiresIn: "1h"
    });
    // update the user exam status to in progress
    req.exam_sts_store.setKey(userExists._id.toString(), status_1.ExamStatusCache.LOGGED_IN);
    res.status(200).json({
        message: "Successfully logged in!",
        userDetails: userExists,
        token: jwtToken
    });
});
// GET details for one user by email and renew the session token
exports.userRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res
            .status(401)
            .json({
            message: "ID is required"
        });
        return;
    }
    let user;
    try {
        user = await attendee_1.Attendee.findById(id);
        if (!user) {
            res
                .status(404)
                .json({
                message: "No user with this email exists"
            });
            return;
        }
    }
    catch (e) {
        config_1.log.warn(`Error finding the user with id - ${id}`);
        res.status(401).json({
            message: "Please provide a valid user id"
        });
        return;
    }
    res
        .status(200)
        .json({ user });
});
exports.userRouter.post("/decrease-attempts", userAuth_1.userAuth, async (req, res) => {
    if (!req.userId && !req.admin_access) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }
    try {
        const user = await attendee_1.Attendee.findById(req.userId);
        if (!user) {
            res.status(404).json({
                message: "No user found"
            });
            return;
        }
        user.attempts -= 1;
        await user.save();
        res.status(200).json({
            message: "Decreased attempts",
            user
        });
        return;
    }
    catch (e) {
        res.status(501).json({
            message: "Something went wrong"
        });
        return;
    }
});
