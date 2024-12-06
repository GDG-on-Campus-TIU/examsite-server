import cors from "cors";
import { getEnv } from "./env";

export const corsOptions = {
  origin: getEnv<string>("CORS_ORIGIN", "http://localhost:3000"),
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);