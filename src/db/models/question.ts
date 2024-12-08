import { Schema, model } from "mongoose";
import { QuestionType } from "../../types/question";
import { ExamType } from "../../types/exam";

export const ExamSchema = new Schema<ExamType>({
  name: {
    type: String,
    required: [true, "Exam name is required"],
  },
  slug: {
    type: String,
    required: [true, "Slug is required!"],
    unique: true
  },
  dept: {
    type: String,
    required: false
  },
  iteration: {
    type: Number,
    required: [true, "Current iteration of the exam is needed"]
  },
  subTopics: {
    type: [String],
    required: [true, "Sub topics are required"],
  },
  mainSubject: {
    type: String,
    required: [true, "Main subject is required for the exam"]
  },
  totalMarks: {
    type: Number,
    required: [true, "Total marks is required for the exam"]
  },
  marksPerQuestion: {
    type: Number,
    required: [true, "Marks per question is required for the exam"]
  },
})

export const ChoiceSchema = new Schema({
  index: { type: Number, required: true },
  choice: { type: String, required: true },
});

export const QuestionSchema = new Schema<QuestionType>({
  question: {
    type: String,
    required: true,
  },
  choices: {
    type: [ChoiceSchema],
    required: true,
    validate: {
      validator: function (choices: Array<{ index: number; choice: string }>) {
        return choices.length >= 4 && choices.length <= 6;
      },
      message: "Choices must have between 4 and 6 options.",
    },
  },
  rightChoice: {
    type: ChoiceSchema,
    required: true,
  },
  examId: {
    type: String,
    required: [true, "Associating the questions to a particular exam is mandatory"]
  }
});

export const Question = model<QuestionType>("Questions", QuestionSchema);
export const Exam = model<ExamType>("Exams", ExamSchema);
