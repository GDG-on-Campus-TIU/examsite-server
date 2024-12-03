import express from "express"
import { getEnv } from "./config/env";

const app = express()
const PORT = getEnv("PORT", 8080)


app.listen(PORT, () => {
  console.log("Server started listening on port:", PORT);
})