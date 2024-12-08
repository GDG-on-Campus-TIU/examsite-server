export type ExamType = {
  name: string
  slug: string
  dept: string
  iteration: number
  mainSubject: string
  subTopics: Array<string>
  totalMarks: number
  marksPerQuestion: number
}
