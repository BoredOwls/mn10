
import express, { type Request, type Response } from "express";
import { Logger } from "./common/logger";

const app = express();
const log = new Logger({ stdout: true })

app.get("/", (_: Request, res: Response) => { res.status(200) });


app.listen(8080, () => {
  log.info("server running on http://localhost:8080");
});

