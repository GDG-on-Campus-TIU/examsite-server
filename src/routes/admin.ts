import { Request, Response, Router } from "express";
import { log } from "../config";
import { generatePassword } from "../utils/hash";
import { Attendee } from "../db/models/attendee";
import { transport } from "../utils/mailer";
import { Exam, Question } from "../db/models/question";
import { ExamType } from "../types/exam";
import { QuestionType, QuestionZOD } from "../types/question";

export const adminRouter = Router()

adminRouter.post("/create-user", async (req: Request, res: Response) => {
  const { name, email, dept, section } = req.body

  if (!req.admin_access) {
    res.status(401).json({
      message: "Unauthorized access is denied!!"
    })
    return
  }

  if (!name || !email || !dept || !section) {
    res
      .status(402)
      .json({ message: "You are missing some of the fields" })
    return
  }

  const isExists = await Attendee.findOne({ email })
  if (isExists) {
    res.status(400).json({ message: "User with this email already exists" })
    return
  }

  let password: string

  try {
    password = generatePassword(email, 8)
  } catch (e) {
    log.error("Error generating the password")
    res.status(501).json({ message: "Oops! It seems that something is wrong from our end" })
    return
  }

  log.info(`Generated password is ${password}`);

  const user = new Attendee({
    email,
    name,
    password,
    attempts: 2,
    dept,
    section
  })

  try {
    await user.save()   
  } catch (error) {
    res.status(500).json({ message: "Error saving the user details on the database" })
  }

  log.info(`Sending attendee creds in their email - ${user.email}`)

  try {
    await transport.sendMail({
      to: user.email,
      html: `
      <h1>Thanks for registering yourself for the exam</h1>
      <br>
      <h2>Here is your credentials to login on the portal</h1>
      <div>
        <span style="color: blue;">Email</span>: <span>${user.email}</span>
        <span style="color: blue;">Password</span>: <span>${password}</span>
      </div>
      <br>
      <h2>Do not share these with anyone, Thank you.</h2>
      `
    })
  } catch (e) {
    log.error(`Error sending mail to - ${user.email}`)
  }

  res.status(200).json({
    message: "Successfully registered attendee with these details",
    user
  })
})

adminRouter.post("/create-exam", async (req: Request, res: Response) => {
  const { name, dept, iteration, mainSubject, subTopics, totalMarks, marksPerQuestion } = req.body;
  
  if (!name || !dept || !iteration || !mainSubject || !totalMarks || !marksPerQuestion || (subTopics as Array<string>).length < 2) {
    res.status(401).json({
      message: "You may have missed couple of fields, please provide all of the fields"
    })
    return
  }

  const safeName = (name as string).replace("-", "_")

  const specialCharRegex = /[^\w\s]/g;

  if (specialCharRegex.test(safeName)) {
    res.status(403).json({
      message: "No special characters (except ' ' and '_') are allowed on the exam name"
    })
    return
  }

  const slug = (safeName as string).replace("_", " ").toLowerCase().split(" ").join("_")

  const isExists = await Exam.findOne({ slug })
  if (isExists) {
    res.status(400).json({
      message: `Exam with slug {${slug}} already exists, try renaming the exam`
    })
    return
  }

  const exam = new Exam<ExamType>({
    name,
    slug,
    mainSubject,
    iteration,
    dept,
    subTopics,
    totalMarks,
    marksPerQuestion
  })

  log.warn(`New exam created with the name - ${name}`)

  try {
    await exam.save()
    log.info(`Successfully created exam with the name - ${name} @ ${exam._id}`)
  } catch (e) {
    log.error(`Error saving the exam into the db - ${name} @ ${exam._id}`)
  }

  res.status(200).json({
    message: `Created exam - ${name} @ ${exam._id}`,
    exam,
    info: "Use this id for associating the questions for this exam"
  })
})

adminRouter.post("/create-question", async (req: Request, res: Response) => {
  if (!req.admin_access) {
    res.status(401).json({
      message: "Unauthorized!"
    })
    return
  }

  let parsedQuestion: QuestionType

  try {
    parsedQuestion = QuestionZOD.parse({ ...req.body }) 
  } catch (e) {
    log.warn("Error creating question")
    log.error((e as Error).stack)
    res.status(403).json({
      message: "You are missing some fields or atleast they are invalid"
    })
    return
  }

  try {
    const isExamExists = await Exam.findById(parsedQuestion.examId)
    if (!isExamExists) {
      log.error(`No exam found with the id - ${parsedQuestion.examId}`)
      res.status(403).json({
        message: `No exam with id - ${parsedQuestion.examId} exists!`
      })
      return
    }
  } catch (e) {
    log.warn("Error finding the exam")
    log.error((e as Error).stack)
    res.status(403).json({
      message: "This is not a valid exam id"
    })
    return
  }

  const question = new Question({ ...parsedQuestion })
  log.warn(`Creating question with question id - ${question._id} & exam id - ${question.examId}`)

  try {
    await question.save()
  } catch (e) {
    log.warn("Error saving question")
    log.error((e as Error).stack)
    res.status(403).json({
      message: "Error saving the question to the DB"
    })
    return
  }

  log.debug(`Created question with question id - ${question._id} & exam id - ${question.examId}`)

  res.status(201).json({
    message: "Created the question!",
    question
  })
})

adminRouter.post("/increase-attempts/:user_id", async (req: Request, res: Response) => {
  const { user_id } = req.params
  const { amt } = req.body

  if (!amt || typeof amt !== "number") {
    res.status(401).json({
      message: "Amount is required in number format"
    })
    return
  }
  
  if (!user_id) {
    res.status(402).json({
      message: "User id is required - /increase-attempts/<user_id>"
    })
    return
  }

  let attendee
  try {
    attendee = await Attendee.findById(user_id)

    if (!attendee) {
      res.status(404).json({
        message: `No user found with the id - ${user_id}`
      })
      return
    }

    attendee.attempts += amt
    
    await attendee.save()

    res.status(200).json({
      message: "Success!",
      attendee
    })
    return

  } catch (e) {
    log.error((e as Error).stack)
    res.status(401).json({
      message: "Either the id is invalid or the max number of attempts have been reached"
    })
    return
  }

})
