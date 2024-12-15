"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transport = void 0;
const nodemailer_1 = require("nodemailer");
const config_1 = require("../config");
const transport = (0, nodemailer_1.createTransport)({
    service: "gmail",
    auth: {
        user: (0, config_1.getEnv)("NODEMAILER_MAIL_ID", "dev.bosepiush@gmail.com"),
        pass: (0, config_1.getEnv)("NODEMAILER_MAIL_PASS", "wlolsuibybjyvkwc")
    }
});
exports.transport = transport;
