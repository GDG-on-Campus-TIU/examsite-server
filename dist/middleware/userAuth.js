"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config");
const userAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    const { a_email, a_pass } = req.query;
    const ADMIN_EMAIL = (0, config_1.getEnv)("ADMIN_USER", "admin@gmail.com");
    const ADMIN_PASSWORD = (0, config_1.getEnv)("ADMIN_PASSWORD", "password");
    if (a_email === ADMIN_EMAIL && a_pass === ADMIN_PASSWORD) {
        req.admin_access = true;
        next();
        return;
    }
    if (!token) {
        res.status(401).json({ message: "No token, authorization denied" });
        return;
    }
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, (0, config_1.getEnv)("JWT_SECRET", "secret__key"));
        req.userId = decoded.userId;
        next();
        return;
    }
    catch (err) {
        res.status(403).json({ message: "Token is not valid" });
        return;
    }
};
exports.userAuth = userAuth;
