import { Router } from "express";
import { Exam, Question } from "../db/models/question";
import { log } from "../config";
import { ExamType } from "../types/exam";

const questionRouter = Router();

questionRouter.get("/get-all/:examId", async (req, res) => {
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

  let exam: ExamType | null

  try {
    exam = await Exam.findById(examId)
  } catch (e) {
    log.warn(`Trying to access invalid exam with id - ${examId}`)
    res.status(403).json({
      message: `Exam id is invalid - ${examId}`
    })
    return
  }

  if (!exam) {
    res.status(403).json({
      message: `No exam exists with id - ${examId}`
    })
    return
  }

  try {
    const questions = await Question.find({ examId }) 
    if (questions.length === 0) {
      res.status(403).json({
        message: `There are no questions published for this exam yet, exam - ${examId}`
      })
      return
    }

    res.status(200).json({
      questions
    })
    return
  } catch (e) {
    log.error("Error fetching the questions")
    log.error(e) 
    log.error((e as Error).stack)
    res.status(401).json({
      message: "Either exam with this id does not exist or you may have entered that wrong!"
    })
    return
  }
});

export { questionRouter }
