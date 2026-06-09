import express, { type Request, type Response } from "express";
import { Logger } from "./common/logger";
import { errorHandler } from "./common/error-handler";
import { authRouter } from "./routes/auth-router";

const app = express();
const log = new Logger({ stdout: true });

app.use(express.json());

// health check endpoint
app.get("/health", (_: Request, res: Response) => {
  res.status(200).send("API SERVER HEALTHY");
});

// route declarations
app.use("/auth", authRouter);

// global error handler
app.use(errorHandler);

// start the server
app.listen(8080, () => {
  log.info("server running on http://localhost:8080");
});
