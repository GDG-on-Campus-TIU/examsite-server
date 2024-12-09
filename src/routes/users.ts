import { Request, Response, Router } from "express";
import { Attendee } from "../db/models/attendee";
import { sign } from "jsonwebtoken"
import { getEnv, log } from "../config";
import { AttendeeType } from "../types/attendee";
import { Document, Types } from "mongoose";
import { userAuth } from "../middleware/userAuth";

export const userRouter = Router();

// POST verifying whether the user has right credentials or not
userRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(401).json({
      message: "Email is required"
    })
    return 
  }

  if (!password) {
    res.status(401).json({
      message: "Password is required"
    })
    return 
  }

  if (!((email as string).split("").includes("@") && (email as string).split("").includes("."))) {
    res.status(401).json({ message: "Invalid email address" })
    return
  }

  let userExists: (AttendeeType & { _id: Types.ObjectId } & { _v: number }) | null

  try {
    userExists = await Attendee.findOne({ email })
  } catch (e) {
    log.error(`Error finding the user with email - ${email}`)
    res.status(501).json({
      message: "Something went wrong from our side"
    })
    return
  }

  if (!userExists) {
    res.status(401).json({ message: "No user exists with the specified email" })
    return
  }

  if (!(userExists.password === (password as string).trim())) {
    res.status(401).json({ message: "Password does not match with the user" })
    return
  }

  const jwtToken = sign(
    {
      email: userExists.email,
      attempts: userExists.attempts,
      userId: userExists._id,
    }, 
    getEnv("JWT_SECRET", "secret__key"), 
    {
      algorithm: "HS512",
      expiresIn: "1h"
    }
  )

  res.status(200).json({
    message: "Successfully logged in!",
    userDetails: userExists,
    token: jwtToken
  })
});

// GET details for one user by email and renew the session token
userRouter.get("/:id", async (req: Request, res: Response) => {
 const { id } = req.params

 if (!id) {
   res
    .status(401)
    .json({
       message: "ID is required"
    })
   return 
 }

 let user: (AttendeeType & { _id: Types.ObjectId } & { _v: number }) | null

 try {
   user = await Attendee.findById(id)
   if (!user) {
     res
     .status(404)
     .json({
       message: "No user with this email exists"
     })
     return
   }
 } catch (e) {
   log.warn(`Error finding the user with id - ${id}`)
   res.status(401).json({
     message: "Please provide a valid user id"
   })
   return
 }

 res
  .status(200)
  .json({ user })

})

userRouter.post("/decrease-attempts", userAuth, async (req: Request, res: Response) => {
  if (!req.userId && !req.admin_access) {
    res.status(401).json({
      message: "Unauthorized"
    })
    return
  }

  try {
    const user = await Attendee.findById(req.userId)

    if (!user) {
      res.status(404).json({
        message: "No user found"
      })
      return
    }

    user.attempts -= 1
    await user.save()

    res.status(200).json({
      message: "Decreased attempts",
      user
    })
    return
  } catch (e) {
    res.status(501).json({
      message: "Something went wrong"
    })
    return
  }
})
