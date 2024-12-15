import cors from "cors";
import { getEnv } from "./env";

export const corsOptions = {
  origin: [
    getEnv<string>("CORS_ORIGIN_ADMIN", "http://localhost:5173"),
    getEnv<string>("CORS_ORIGIN_WEB", "http://localhost:5173"),
  ],
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
