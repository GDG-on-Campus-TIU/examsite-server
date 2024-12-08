import { model, Schema } from "mongoose"
import { AttendeeType } from "../../types/attendee"

export const AttendeeSchema = new Schema<AttendeeType>({
  name: {
    type: String,
    required: [true, "Name is required for valid attendee registration"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  dept: {
    type: String,
    required: [true, "Dept is required"]
  },
  section: {
    type: String,
    required: [true, "Section is required"]
  },
  attempts: {
    type: Number,
    default: 2,
    max: 6,
  }
})

export const Attendee = model<AttendeeType>("Attendees", AttendeeSchema)
