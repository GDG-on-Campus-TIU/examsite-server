import s from "swagger-autogen"

const swagger = s();

const doc = {
  name: "SOF Exam Server",
  description: "This server will hold the exam question sheets as well as calculate the score and also habdle the examinatino through the portal",
  host: "http://localhost:{port}/api/v1"
}

const outputFile = "../swagger-doc.json"
const routes = [
  "../routes/admin.ts",
  "../routes/exam.ts",
  "../routes/question.ts",
  "../routes/users.ts",
]

swagger(outputFile, routes, doc)
