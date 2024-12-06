import { Schema } from "mongoose";

export type QuestionType = {
  question: string;
  choices: Array<{ index: number; choice: string }>;
  rightChoice: { index: number; choice: string };
  examId: typeof Schema.ObjectId
}
