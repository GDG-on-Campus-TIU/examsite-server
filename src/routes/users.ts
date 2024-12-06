import { Request, Response, Router } from "express";
import { Attendee } from "../db/models/attendee";
import { sign } from "jsonwebtoken"
import { getEnv } from "../config";

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

  const userExists = await Attendee.findOne({ email })
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

 const user = await Attendee.findById(id)
 if (!user) {
   res
     .status(401)
     .json({
       message: "No user with this email exists"
     })
   return
 }

 res
  .status(200)
  .json({ user })

})
