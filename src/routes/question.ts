import { Router } from "express";
import { userAuth } from "../middleware/userAuth";
import { Question } from "../db/models/question";
import { log } from "../config";

const questionRouter = Router();

questionRouter.get("/get-all/:examId", userAuth, async (req, res) => {
  const { examId } = req.params
  if (!examId) {
    res.status(403).json({
      message: "Please provide the exam id - /get-all/<exam-id>"
    })
    return
  }

  if (!req.admin_access && !req.userId) {
    res.status(401).json({
      message: "Unauthorized!"
    })
    return
  }

  try {
    const questions = await Question.find({ examId }) 
    if (questions.length === 0) {
      res.status(403).json({
        message: `There are no questions published for this exam yet, exam - ${examId}`
      })
    }

    res.status(200).json({
      questions
    })
  } catch (e) {
    log.error("Error fetching the questions")
    log.error(e) 
    log.error((e as Error).stack)
    res.status(401).json({
      message: "Either exam with this id does not exist or you may have entered that wrong!"
    })
  }
});

export { questionRouter }
