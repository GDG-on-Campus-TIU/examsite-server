export type ExamType = {
  name: string
  dept: string
  mainSubject: string

  totalMarks: number
  marksPerQuestion: number
  started: "YES" | "NO"
  // start_date: Date
}
