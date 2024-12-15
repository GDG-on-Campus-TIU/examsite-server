"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const config_1 = require("../config");
const config_2 = require("../config");
const adminAuth = async (req, res, next) => {
    const { a_email, a_pass } = req.query;
    const ADMIN_EMAIL = (0, config_1.getEnv)("ADMIN_USER", "admin@gmail.com");
    const ADMIN_PASSWORD = (0, config_1.getEnv)("ADMIN_PASSWORD", "password");
    if (!a_email || !a_pass) {
        res
            .status(402)
            .json({ message: "ADMIN CREDENTIALS REQUIRED THROUGH QUERY STRING" });
        return;
    }
    if (a_email !== ADMIN_EMAIL || a_pass !== ADMIN_PASSWORD) {
        config_2.log.error("Unauthorized entry!!!");
        res
            .status(401)
            .json({ message: "UAUTHORIZED ACCESS WITHOUT ADMIN PERMISSION" });
        return;
    }
    req.admin_access = true;
    next();
};
exports.adminAuth = adminAuth;
