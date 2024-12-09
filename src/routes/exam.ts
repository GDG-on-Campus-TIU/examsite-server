import { Request, Response, Router } from "express";
import { AttendeeType } from "../types/attendee";
import { Types } from "mongoose";
import { Attendee } from "../db/models/attendee";
import { ExamType } from "../types/exam";
import { Exam } from "../db/models/question";
import { Submission } from "../db/models/submission";
import { SubmissionZod } from "../types/submission";
import { log } from "../config";

export const examRouter = Router()

examRouter.post("/submit-exam/:exam_id", async (req: Request, res: Response) => {
  const { exam_id } = req.params
  const { response }: { response: Array<Record<string, number>> } = req.body
  
  if (!req.userId) {
    res.status(401).json({
      message: "Unauthorized!"
    })
    return
  }

  if (!exam_id) {
    res.status(401).json({
      message: "No exam id provided with the request"
    })
    return
  }

  try {
    const isAttendeeSubmissionExists = await Submission.findOne({ attendeeId: req.userId, examId: exam_id })
    
    if (isAttendeeSubmissionExists) {
      res.status(400).json({
        message: "You have already exhausted your submission"
      })
      return
    }
  } catch (e) {
    res.status(402).json({
      message: "Something wrong happened on our end"
    })
    return
  }

  let attendee: (AttendeeType & { _id: Types.ObjectId } & { _v: number }) | null
  let exam: (ExamType & { _id: Types.ObjectId } & { _v: number }) | null

  try {
    attendee = await Attendee.findById(req.userId)

    if (!attendee) {
      res.status(404).json({
        message: `No user found with the id - ${req.userId}`
      })
      return
    }
  } catch (e) {
    res.status(401).json({
      message: "Please provide a valid user id"
    })
    return
  }

  if (!(attendee.attempts > 0)) {
    res.status(401).json({
      message: "You have exhausted your attempts, please contact the admins to increase your attempts"
    })
    return
  }

  try {
    exam = await Exam.findById(exam_id)

    if (!exam) {
      res.status(404).json({
        message: `No exam found with the id - ${exam_id}`
      })
      return
    }
  } catch (e) {
    res.status(401).json({
      message: "Please provide a valid exam id with the request"
    })
    return
  }

  try {
    SubmissionZod.parse({
      attendeeId: req.userId,
      examId: exam_id,
      response
    })
  } catch (e) {
    log.error("Error parsing the submission")
    res.status(402).json({
      message: "Please provide valid answer types"
    })
    return
  }

  try {
    const submission = new Submission({
      attendeeId: req.userId,
      examId: exam_id,
      response
    })

    await submission.save()

    res.status(201).json({
      message: "Successfully submitted the answers to the server",
      submission
    })
    return
    
  } catch (e) {
    log.error("Error creating the submission with the details")
    res.status(500).json({
      message: "Something went wrong from our end."
    })
    return
  }

})

examRouter.get("/get-submissions/:student_id", async (req: Request, res: Response) => {
  if (!req.admin_access && !req.userId) {
    res.status(401).json({
      message: "Unauthorized"
    })
    return
  }

  const { student_id } = req.params

  if (!student_id) {
    res.status(404).json({
      message: "Please provide the student id"
    })
    return
  }

  try {
    const userExist = await Attendee.findById(student_id)

    if (!userExist) {
      res.status(404).json({
        message: "No user found with the provided id"
      })
      return
    }
  } catch (e) {
    res.status(401).json({
      message: "Provide a valid user id"
    })
    return
  }

  try {
    const submissions = await Submission.find({
      attendeeId: student_id
    })

    if (!submissions) {
      res.status(404).json({
        message: "No submissions found for the user"
      })
      return
    }

    res.status(200).json({
      message: "Success",
      submissions
    })
    return
  } catch (e) {
    res.status(401).json({
      message: "Something went wrong"
    })
    return
  }
})
