import { Request, Response, Router } from "express";
import { log } from "../config";

export const healthCheckRouter = Router()

healthCheckRouter.get("/", (req: Request, res: Response) => {
  log.warn(`Ping from - ${req.hostname} @ ${req.ip}`)
  res.status(200).json({
    ping: "PONG",
    healthy: true
  })
})
