"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attendee = exports.AttendeeSchema = void 0;
const mongoose_1 = require("mongoose");
exports.AttendeeSchema = new mongoose_1.Schema({
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
});
exports.Attendee = (0, mongoose_1.model)("Attendees", exports.AttendeeSchema);
