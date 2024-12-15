"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
if (process.env.NODE_ENV !== "production") {
    (0, dotenv_1.config)({
        path: process.cwd() + "/src/config/.env",
    });
}
const getEnv = (key, d) => {
    const newKey = key.replace("_", " ").toLowerCase().replace(" ", "-");
    const secretPath = `/run/secrets/${newKey}`;
    if (fs_1.default.existsSync(secretPath)) {
        return fs_1.default.readFileSync(secretPath, "utf-8").trim();
    }
    return process.env[key] ?? d;
};
exports.getEnv = getEnv;
