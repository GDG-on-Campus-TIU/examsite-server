import express from "express"
import { getEnv, corsMiddleware, loggerMiddleware, info } from "./config";
import { initDB } from "./db";
import { errorHandler } from "./middleware/error";
import { userRouter, questionRouter, adminRouter } from "./routes";
import { adminAuth } from "./middleware/admin";

const app = express()
const PORT = getEnv<number>("PORT", 8080)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(corsMiddleware)
app.use(loggerMiddleware)
app.use(errorHandler)

app.use("/api/v1/questions", questionRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin", adminAuth, adminRouter)

app.listen(PORT, async () => {
  info(`Server is running on http://localhost:${PORT}`)
  await initDB()
})
