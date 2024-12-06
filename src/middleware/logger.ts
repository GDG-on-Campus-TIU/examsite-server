import morgan from "morgan";
import { logger } from "../config";

const loggerFormat =
  ":method :url :status :response-time ms - :res[content-length]";

morgan(loggerFormat, {
  stream: {
    write: (message) => {
      const logObject = {
        method: message.split(" ")[0],
        url: message.split(" ")[1],
        status: message.split(" ")[2],
        responseTime: message.split(" ")[3],
        contentLength: message.split(" ")[4],
      };
      logger.info(JSON.stringify(logObject));
    },
  },
});
