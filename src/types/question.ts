import { z } from "zod";

export type QuestionType = {
  question: string;
  choices: Array<{ index: number; choice: string }>;
  rightChoice: { index: number; choice: string };
  examId: string
}

export const QuestionZOD = z.object({
  question: z.string(),
  choices: z.array(
    z.object({
      index: z.number().min(1).max(6),
      choice: z.string()
    })
  ),
  rightChoice: z.object({
    index: z.number().min(1).max(6),
    choice: z.string()
  }),
  examId: z.string()
})
