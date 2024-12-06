import { Router } from "express";
import { userAuth } from "../middleware/userAuth";

const questionRouter = Router();

questionRouter.get("/get-all", userAuth, (req, res) => {
  res.status(200).json({ questions: []})
});

export { questionRouter }
