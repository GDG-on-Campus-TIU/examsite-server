"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const initDB = async () => {
    config_1.log.info("Starting to initialize the database");
    let connection;
    try {
        connection = await mongoose_1.default.connect((0, config_1.getEnv)("MONGO_URL", "mongodb://root:root@localhost:27017"), {
            serverApi: { version: "1", strict: true },
        });
        config_1.log.info(`MongoDB Connected: ${connection.connection.host}`);
        config_1.log.info(`Database name: ${connection.connection.name}`);
        config_1.log.info("Database initialization completed");
    }
    catch (e) {
        config_1.log.error("Error while connecting to the database");
        config_1.log.error(e);
    }
};
exports.initDB = initDB;
