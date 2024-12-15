"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = exports.corsOptions = void 0;
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./env");
exports.corsOptions = {
    origin: [
        (0, env_1.getEnv)("CORS_ORIGIN_ADMIN", "http://localhost:5173"),
        (0, env_1.getEnv)("CORS_ORIGIN_WEB", "http://localhost:5173"),
    ],
    credentials: true,
};
exports.corsMiddleware = (0, cors_1.default)(exports.corsOptions);
