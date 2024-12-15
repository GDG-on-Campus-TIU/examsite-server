"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const db_1 = require("./db");
const error_1 = require("./middleware/error");
const routes_1 = require("./routes");
const admin_1 = require("./middleware/admin");
const userAuth_1 = require("./middleware/userAuth");
const swagger_ui_express_1 = require("swagger-ui-express");
const swagger_doc_json_1 = __importDefault(require("./swagger-doc.json"));
const cache_1 = require("./middleware/cache");
const app = (0, express_1.default)();
const PORT = (0, config_1.getEnv)("PORT", 8080);
const API_VER = (0, config_1.getEnv)("API_VERSION", "/api/v1");
// predefined middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(config_1.corsMiddleware);
app.use(config_1.loggerMiddleware);
app.use(error_1.errorHandler);
app.use(cache_1.examAnalyticsStore);
// routes
app.use(`${API_VER}/users`, routes_1.userRouter);
app.use(`${API_VER}/questions`, userAuth_1.userAuth, routes_1.questionRouter);
app.use(`${API_VER}/admin`, admin_1.adminAuth, routes_1.adminRouter);
app.use(`${API_VER}/exam`, userAuth_1.userAuth, routes_1.examRouter);
app.use(`${API_VER}/ping`, routes_1.healthCheckRouter);
// api docs
app.use(`${API_VER}/docs`, swagger_ui_express_1.serve, (0, swagger_ui_express_1.setup)(swagger_doc_json_1.default));
// server startup
app.listen(PORT, async () => {
    (0, config_1.info)(`Server is running on http://localhost:${PORT}${API_VER}`);
    await (0, db_1.initDB)();
    (0, config_1.warn)("Attached and loaded Cache Store");
});
app.use(error_1.errorHandler);
