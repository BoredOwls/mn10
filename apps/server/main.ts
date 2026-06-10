
import express, { type Request, type Response } from "express";
import { Logger } from "./common/logger";
import { errorHandler } from "./common/error-handler";
import { authRouter } from "./routes/auth-router";
import { connectDb } from "./db";

const app = express();
const log = new Logger({ stdout: true });

app.use(express.json());

app.get("/health", (_: Request, res: Response) => {
  res.status(200).send("API SERVER HEALTHY");
});

app.use("/auth", authRouter);

app.use(errorHandler);

async function start() {
  await connectDb();
  log.info("connected to postgres database");

  app.listen(8080, () => {
    log.info("server running on http://localhost:8080");
  });
}

start().catch((err: Error) => {
  log.error(`failed to start [ErrorType: ${err.name}] caused by ${err.cause} \nmessage: ${err.message || "none"}\n\n${err.stack}`);
  process.exit(1);
});
