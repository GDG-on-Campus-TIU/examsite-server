import express from "express"
import { getEnv, corsMiddleware, loggerMiddleware, info, warn } from "./config";
import { initDB } from "./db";
import { errorHandler } from "./middleware/error";
import { userRouter, questionRouter, adminRouter, examRouter, healthCheckRouter } from "./routes";
import { adminAuth } from "./middleware/admin";
import { userAuth } from "./middleware/userAuth";
import { serve, setup } from "swagger-ui-express"
import swaggerDoc from "./swagger-doc.json"
import { examAnalyticsStore } from "./middleware/cache";

const app = express()
const PORT = getEnv<number>("PORT", 8080)
const API_VER = getEnv<string>("API_VERSION", "/api/v1")

// predefined middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(corsMiddleware)
app.use(loggerMiddleware)
app.use(errorHandler)
app.use(examAnalyticsStore)

// routes
app.use(`${API_VER}/users`, userRouter)
app.use(`${API_VER}/questions`, userAuth, questionRouter)
app.use(`${API_VER}/admin`, adminAuth, adminRouter)
app.use(`${API_VER}/exam`, userAuth, examRouter)
app.use(`${API_VER}/ping`, healthCheckRouter)

// api docs
app.use(`${API_VER}/docs`, serve, setup(swaggerDoc))

// server startup
app.listen(PORT, async () => {
  info(`Server is running on http://localhost:${PORT}${API_VER}`)
  await initDB()
  warn("Attached and loaded Cache Store")
})

app.use(errorHandler)
