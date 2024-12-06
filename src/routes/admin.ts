import { Request, Response, Router } from "express";
import { log } from "../config";
import { generatePassword } from "../utils/hash";
import { Attendee } from "../db/models/attendee";
import { transport } from "../utils/mailer";
import { Exam } from "../db/models/question";
import { ExamType } from "../types/exam";

export const adminRouter = Router()

adminRouter.post("/create-user", async (req: Request, res: Response) => {
  const { name, email } = req.body

  if (!req.admin_access) {
    res.status(401).json({
      message: "Unauthorized access is denied!!"
    })
    return
  }

  if (!name || !email) {
    res
      .status(402)
      .json({ message: "Attendee's email and name is required" })
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
  const { name, dept, iteration, mainSubject, subTopics } = req.body;

  const specialCharRegex = /[^\w\s]/g;

  if (specialCharRegex.test(name)) {
    res.status(403).json({
      message: "No special characters (except ' ' and '_') are allowed on the exam name"
    })
    return
  }

  const slug = (name as string).replace("_", " ").toLowerCase().split(" ").join("_")
  
  if (!name || !dept || !iteration || !mainSubject || (subTopics as Array<string>).length < 2) {
    res.status(401).json({
      message: "You may have missed couple of fields, please provide all of the fields"
    })
    return
  }

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
    subTopics: [...subTopics],
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
