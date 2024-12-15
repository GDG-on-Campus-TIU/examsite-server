"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckRouter = void 0;
const express_1 = require("express");
const config_1 = require("../config");
exports.healthCheckRouter = (0, express_1.Router)();
exports.healthCheckRouter.get("/", (req, res) => {
    config_1.log.warn(`Ping from - ${req.hostname} @ ${req.ip}`);
    res.status(200).json({
        ping: "PONG",
        healthy: true
    });
});
