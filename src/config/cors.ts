import cors from "cors";
import { getEnv } from "./env";

export const corsOptions = {
  origin: getEnv<string>("CORS_ORIGIN", "http://localhost:5173"),
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);