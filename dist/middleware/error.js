"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const config_1 = require("../config");
const errorHandler = (err, _, __, next) => {
    config_1.log.error(err.stack);
    next({ message: err.message });
};
exports.errorHandler = errorHandler;
