"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
const swagger = (0, swagger_autogen_1.default)();
const doc = {
    name: "SOF Exam Server",
    description: "This server will hold the exam question sheets as well as calculate the score and also habdle the examinatino through the portal",
    host: "http://localhost:{port}/api/v1"
};
const outputFile = "../swagger-doc.json";
const routes = [
    "../routes/admin.ts",
    "../routes/exam.ts",
    "../routes/question.ts",
    "../routes/users.ts",
];
swagger(outputFile, routes, doc);
