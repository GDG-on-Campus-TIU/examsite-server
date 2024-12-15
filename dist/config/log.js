"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = exports.log = exports.error = exports.debug = exports.warn = exports.info = void 0;
const winston_1 = __importDefault(require("winston"));
const morgan_1 = __importDefault(require("morgan"));
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const level = () => {
    const env = process.env.NODE_ENV || "development";
    const isDevelopment = env === "development";
    return isDevelopment ? "debug" : "warn";
};
const colors = {
    error: "red",
    warn: "yellow",
    info: "blue",
    http: "magenta",
    debug: "white",
};
winston_1.default.addColors(colors);
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "DD MMM, YYYY - HH:mm:SS A" }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.align(), winston_1.default.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`));
const jsonFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`), winston_1.default.format.json());
const transports = [
    new winston_1.default.transports.Console(),
    new winston_1.default.transports.File({ filename: "logs/error.log", level: "error", format: jsonFormat }),
    new winston_1.default.transports.File({ filename: "logs/app.log" }),
];
const log = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports,
});
exports.log = log;
const { info, warn, debug, error } = log;
exports.info = info;
exports.warn = warn;
exports.debug = debug;
exports.error = error;
const stream = {
    write: (message) => log.http(message.trim()),
};
const skip = () => {
    const env = process.env.NODE_ENV || "development";
    return env !== "development";
};
const loggerMiddleware = (0, morgan_1.default)(":remote-addr :method :url :status - :response-time ms", { stream, skip });
exports.loggerMiddleware = loggerMiddleware;
