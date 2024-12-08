import { Schema, model } from "mongoose";
import { SubmissionType } from "../../types/submission";


export const SubmissionSchema = new Schema<SubmissionType>({
  attendeeId: {
    type: String,
    required: [true, "Without the attendee details can't submit the exam"],
  },
  examId: {
    type: String,
    required: [true, "Exam details is required for the submission"]
  },
  response: {
    type: [{
      questionId: {
        type: String,
        required: [true, "Question id is required for the answer to be associated with the right question"],
      },
      choiceIndex: {
        type: Number,
        required: [true, "Choice is required to be the answer evaluated of"]
      },
    }],
    required: [true, "Answers are required to fill the exam details"]
  }
})

export const Submission = model<SubmissionType>("Submissions", SubmissionSchema)
