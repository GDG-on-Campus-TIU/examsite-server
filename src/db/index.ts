import mongoose, { Mongoose } from "mongoose";
import { getEnv, log } from "../config";

export const initDB = async () => {
  log.info("Starting to initialize the database");

  let connection: Mongoose;

  try {
    connection = await mongoose.connect(
      getEnv<string>("MONGO_URL", "mongodb://root:root@localhost:27017"),
      {
        serverApi: { version: "1", strict: true },
      }
    );

    log.info(`MongoDB Connected: ${connection.connection.host}`);
    log.info(`Database name: ${connection.connection.name}`);
    log.info("Database initialization completed");
  } catch (e) {
    log.error("Error while connecting to the database");
    log.error(e);
  }
};
