import { z } from "zod";

export const SubmissionZod = z.object({
  attendeeId: z.string(),
  examId: z.string(),
  response: z.array(
    z.object({
      questionId: z.string(),
      choiceIndex: z.number().min(1).max(6)
    })
  ) 
})

export type SubmissionType = {
  attendeeId: string
  examId: string
  response: Array<Record<string, number>>
}
