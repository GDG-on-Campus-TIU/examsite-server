import { Schema, model } from "mongoose";
import { AttendeeSchema } from "./attendee";
import { ExamSchema } from "./question";

export const SubmissionSchema = new Schema({
  attendee: {
    type: AttendeeSchema,
    required: [true, "Without the attendee details can't submit the exam"]
  },
  exam: {
    type: ExamSchema,
    required: [true, "Exam details is required for the submission"]
  },
  answers: {
    type [Answers],
    required: [true, "Answers are required to fill the exam details"]
  }
})
