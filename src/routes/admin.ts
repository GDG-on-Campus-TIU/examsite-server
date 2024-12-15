import { Request, Response, Router } from "express";
import { log } from "../config";
import { Attendee } from "../db/models/attendee";
import { Exam, Question } from "../db/models/question";
import { ExamType } from "../types/exam";
import { QuestionType, QuestionZOD } from "../types/question";
import { generatePassword } from "../utils/hash";
import { transport } from "../utils/mailer";

export const adminRouter = Router();

adminRouter.post("/create-user", async (req: Request, res: Response) => {
	const { name, email, dept, section } = req.body;

	if (!req.admin_access) {
		res.status(401).json({
			message: "Unauthorized access is denied!!",
		});
		return;
	}

	if (!name || !email || !dept || !section) {
		res.status(402).json({ message: "You are missing some of the fields" });
		return;
	}

	const isExists = await Attendee.findOne({ email });
	if (isExists) {
		res.status(400).json({
			message: "User with this email already exists",
		});
		return;
	}

	let password: string;

	try {
		password = generatePassword(email, 8);
	} catch (e) {
		log.error("Error generating the password");
		res.status(501).json({
			message: "Oops! It seems that something is wrong from our end",
		});
		return;
	}

	log.info(`Generated password is ${password}`);

	const user = new Attendee({
		email,
		name,
		password,
		attempts: 2,
		dept,
		section,
	});

	try {
		await user.save();
	} catch (error) {
		res.status(500).json({
			message: "Error saving the user details on the database",
		});
	}

	log.info(`Sending attendee creds in their email - ${user.email}`);

	try {
		await transport.sendMail({
			to: user.email,
			html: `
      <h1>Thanks for registering yourself for the exam</h1>
      <br>
      <h2>Here is your credentials to login on the portal</h1>
      <div>
        <span style="color: blue;">Email</span>: <span>${user.email}</span>
        <span style="color: blue;">Password</span>: <span>${password}</span>
      </div>
      <br>
      <h2>Do not share these with anyone, Thank you.</h2>
      `,
		});
	} catch (e) {
		log.error(`Error sending mail to - ${user.email}`);
	}

	res.status(200).json({
		message: "Successfully registered attendee with these details",
		user,
	});
});

// A Get route to show the attendees in the database lol
// noice comment btw ~ piush (lol)
adminRouter.get("/getuser/batch/:batch", async (req: Request, res: Response): Promise<any> => {
  const batch = req.params.batch;
  if (!req.admin_access) {
    res.status(401).json({
      message: "Unauthorized access is denied!!",
    });
    return;
  }

  if (!batch) {
    return res.status(400).json({
      message: "Batch parameter is required",
    });
  }

  try {

    const attendees = await Attendee.find({ dept: batch });

    if (!attendees || attendees.length === 0) {
      return res.status(404).json({
        message: `No attendees found for batch ${batch}`,
      });
    }

    const attendeeDetails = attendees.map((attendee) => ({
      _id: attendee._id,
      name: attendee.name,
      email: attendee.email,
      dept: attendee.dept,
      studentId: attendee.studentId,
		attempts: attendee.attempts,

    }));

    res.status(200).json({
      message: `Found ${attendeeDetails.length} attendee(s) in batch ${batch}`,
      attendees: attendeeDetails,
    });
    return
  } catch (e) {
    res.status(500).json({
      message: "An error occurred while fetching attendees.",
    });
    return
  }
});


adminRouter.post("/create-exam", async (req: Request, res: Response) => {
	const {
		name,
		dept,
		iteration,
		mainSubject,
		subTopics,
		totalMarks,
		marksPerQuestion,
	} = req.body;

	if (
		!name ||
		!dept ||
		!iteration ||
		!mainSubject ||
		!totalMarks ||
		!marksPerQuestion
	) {
		res.status(401).json({
			message:
				"You may have missed couple of fields, please provide all of the fields",
		});
		return;
	}

	const safeName = (name as string).replace("-", "_");

	const specialCharRegex = /[^\w\s]/g;

	if (specialCharRegex.test(safeName)) {
		res.status(403).json({
			message:
				"No special characters (except ' ' and '_') are allowed on the exam name",
		});
		return;
	}

	const slug = (safeName as string)
		.replace("_", " ")
		.toLowerCase()
		.split(" ")
		.join("_");

	const isExists = await Exam.findOne({ dept });
	if (isExists) {
		res.status(400).json({
			message: `Exam with dept {${dept}} already exists, try renaming the exam`,
		});
		return;
	}

	const exam = new Exam<ExamType>({
		name,
		slug,
		mainSubject,
		iteration,
		dept,
		subTopics,
		totalMarks,
		marksPerQuestion,
		started: "NO",
		start_date: new Date(),
	});

	log.warn(`New exam created with the name - ${name}`);

	try {
		await exam.save();
		log.info(
			`Successfully created exam with the name - ${name} @ ${exam._id}`
		);
	} catch (e) {
		log.error(`Error saving the exam into the db - ${name} @ ${exam._id}`);
	}

	res.status(200).json({
		message: `Created exam - ${name} @ ${exam._id}`,
		exam,
		info: "Use this id for associating the questions for this exam",
	});
});

adminRouter.get("/get-exams/:batch", async (req: Request, res: Response) => {
	console.log("searching for " + req.params.batch);
	const exam = await Exam.findOne({
		dept: req.params.batch,
	});

	// Exam.find({}).then((res) => console.log(res));

	if (!exam) {
		res.json({
			message: "no exams found for this batch",
			found: false,
		});
		return;
	}

	res.json({
		message: "found exam",
		found: true,
		exam: exam,
	});
});

adminRouter.post("/create-question", async (req: Request, res: Response) => {
	if (!req.admin_access) {
		res.status(401).json({
			message: "Unauthorized!",
		});
		return;
	}

	let parsedQuestion: QuestionType;

	try {
		parsedQuestion = QuestionZOD.parse({ ...req.body });
	} catch (e) {
		log.warn("Error creating question");
		log.error((e as Error).stack);
		res.status(403).json({
			message: "You are missing some fields or atleast they are invalid",
		});
		return;
	}

	try {
		const isExamExists = await Exam.findById(parsedQuestion.examId);
		if (!isExamExists) {
			log.error(`No exam found with the id - ${parsedQuestion.examId}`);
			res.status(403).json({
				message: `No exam with id - ${parsedQuestion.examId} exists!`,
			});
			return;
		}
	} catch (e) {
		log.warn("Error finding the exam");
		log.error((e as Error).stack);
		res.status(403).json({
			message: "This is not a valid exam id",
		});
		return;
	}

	const question = new Question({ ...parsedQuestion });
	log.warn(
		`Creating question with question id - ${question._id} & exam id - ${question.examId}`
	);

	try {
		await question.save();
	} catch (e) {
		log.warn("Error saving question");
		log.error((e as Error).stack);
		res.status(403).json({
			message: "Error saving the question to the DB",
		});
		return;
	}

	log.debug(
		`Created question with question id - ${question._id} & exam id - ${question.examId}`
	);

	res.status(201).json({
		message: "Created the question!",
		question,
	});
});

adminRouter.get("/get-questions/:id", async (req, res) => {
	const id = req.params.id;
	const questions = await Question.find({ examId: id });

	if (questions) {
		res.json({
			questions: questions,
		});
	}
});

adminRouter.post(
	"/increase-attempts/:user_id",
	async (req: Request, res: Response) => {
		const { user_id } = req.params;
		const { amt } = req.body;

		if (!amt || typeof amt !== "number") {
			res.status(401).json({
				message: "Amount is required in number format",
			});
			return;
		}

		if (!user_id) {
			res.status(402).json({
				message: "User id is required - /increase-attempts/<user_id>",
			});
			return;
		}

		let attendee;
		try {
			attendee = await Attendee.findById(user_id);

			if (!attendee) {
				res.status(404).json({
					message: `No user found with the id - ${user_id}`,
				});
				return;
			}

			attendee.attempts += amt;

			await attendee.save();

			res.status(200).json({
				message: "Success!",
				attendee,
			});
			return;
		} catch (e) {
			log.error((e as Error).stack);
			res.status(401).json({
				message:
					"Either the id is invalid or the max number of attempts have been reached",
			});
			return;
		}
	}
);

adminRouter.delete("/delete-question/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!req.admin_access) {
	  res.status(401).json({
		message: "Unauthorized access is denied!!",
	  });
	  return;
	}

	if (!id) {
	  res.status(400).json({
		message: "Question id is required",
	  });
	  return;
	}

	try {
	  const question = await Question.findById(id);

	  if (!question) {
		res.status(404).json({
		  message: `No question found`,
		});
		return;
	  }

	  // Proceed to delete the question
	  await Question.deleteOne({ _id: id });

	  res.status(200).json({
		message: `Successfully deleted the question`,
	  });
	  return;
	} catch (e) {
	  log.error((e as Error).stack);
	  res.status(500).json({
		message: "An error occurred while deleting the question",
	  });
	  return;
	}
  });
  adminRouter.delete("/delete-exam/:exam_id", async (req: Request, res: Response) => {
	const { exam_id } = req.params;

	if (!req.admin_access) {
	  res.status(401).json({
		message: "Unauthorized"
	  });
	  return;
	}

	if (!exam_id) {
	  res.status(404).json({
		message: "Exam id is required"
	  });
	  return;
	}

	try {
	  const exam = await Exam.findById(exam_id);

	  if (!exam) {
		res.status(404).json({
		  message: `No exam found with the id - ${exam_id}`
		});
		return;
	  }

	  await Exam.findByIdAndDelete(exam_id);

	  res.status(200).json({
		message: "Exam deleted successfully"
	  });
	  return;
	} catch (e) {
	  res.status(500).json({
		message: "Error occurred while deleting exam"
	  });
	  return;
	}
  });

  adminRouter.delete("/delete-attendee/:attendee_id", async (req: Request, res: Response) => {
	const { attendee_id } = req.params;

	if (!req.admin_access) {
	  res.status(401).json({
		message: "Unauthorized"
	  });
	  return;
	}

	if (!attendee_id) {
	  res.status(404).json({
		message: "Attendee id is required"
	  });
	  return;
	}

	try {
	  const attendee = await Attendee.findById(attendee_id);

	  if (!attendee) {
		res.status(404).json({
		  message: `No attendee found with the id - ${attendee_id}`
		});
		return;
	  }

	  await Attendee.findByIdAndDelete(attendee_id);

	  res.status(200).json({
		message: "Attendee deleted successfully"
	  });
	  return;
	} catch (e) {
	  res.status(500).json({
		message: "Error occurred while deleting attendee"
	  });
	  return;
	}
  });



adminRouter.post("/start-exam/:exam_id", async (req: Request, res: Response) => {
  const { exam_id } = req.params

  if (!req.admin_access) {
    res.status(401).json({
      message: "Unauthorized"
    })
    return
  }

  if (!exam_id) {
    res.status(404).json({
      messsage: "Exam id is required"
    })
    return
  }

  try {
    const exam = await Exam.findById(exam_id)

    if (!exam) {
      res.status(404).json({
        message: `No exam found with the id - ${exam_id}`
      })
      return
    }

    if (exam.started === "YES") {
      res.status(400).json({
        message: "Exam is already started"
      })
      return
    }

    exam.started = "YES"

    await exam.save()

    res.status(200).json({
      message: "Exam is started!",
      exam
    })
    return
  } catch (e) {
    res.status(404).json({
      message: "Please provide a valid exam id"
    })
    return
  }
})

adminRouter.post("/stop-exam/:exam_id", async (req: Request, res: Response) => {
  const { exam_id } = req.params

  if (!req.admin_access) {
    res.status(401).json({
      message: "Unauthorized"
    })
    return
  }

  if (!exam_id) {
    res.status(404).json({
      messsage: "Exam id is required"
    })
    return
  }

  try {
    const exam = await Exam.findById(exam_id)

    if (!exam) {
      res.status(404).json({
        message: `No exam found with the id - ${exam_id}`
      })
      return
    }

    if (exam.started === "NO") {
      res.status(400).json({
        message: "Exam is already stopped"
      })
      return
    }

    exam.started = "NO"

    await exam.save()

    res.status(200).json({
      message: "Exam is stopped!",
      exam
    })
    return
  } catch (e) {
    res.status(404).json({
      message: "Please provide a valid exam id"
    })
    return
  }
})
