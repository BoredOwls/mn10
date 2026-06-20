
/*  
 *	Logger utility for logging to file/stdout with stack trace(source of expression that called this log line)
	usage guide:
 
    const log = new Logger({ level: "debug" });                          // stdout only
    const log = new Logger({ stdout: false, filePath: "logs/app.log" }); // file only
    const log = new Logger({ stdout: true,  filePath: "logs/app.log" }); // both
 
    log.debug("starting up");
    log.info(`connected to ${host}:${port}`);
    log.warn("retrying request");
    log.error("connection refused");
 
	log.close(); // flush and close file stream on shutdown 
*/


import type { NextFunction, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
 
export type LogLevel = "debug" | "info" | "warn" | "error";
export interface LoggerOptions {
  level?: LogLevel;
  stdout?: boolean;
  filePath?: string;
}

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};


export class Logger {
  private level: LogLevel;
  private stdout: boolean;
  private fileStream: fs.WriteStream | null = null;
 
  constructor(opts: LoggerOptions = {}) {
    this.level = opts.level ?? "info";
    this.stdout = opts.stdout ?? true;
 
    if (opts.filePath) {
      const dir = path.dirname(opts.filePath);
      if (dir && dir !== ".") fs.mkdirSync(dir, { recursive: true });
      this.fileStream = fs.createWriteStream(opts.filePath, { flags: "a" });
    }
  }
 
  private timestamp(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const ms = String(now.getMilliseconds()).padStart(3, "0");
    return `${dd}-${mm}-${yyyy}(${hh}:${min}:${ss}.${ms})`;
  }
 
  private caller(): string {
    const stack = new Error().stack;
    if (!stack) 
		return "unknown";
    
	// lines: 0=Error, 1=caller(), 2=log(), 3=debug/info/etc, 4=actual caller
    const line = stack.split("\n")[4]?.trim();
    if (!line) 
		return "unknown";

    // "at functionName (file:line:col)" or "at file:line:col"
    const match = line.match(/at (.+?) \((.+):(\d+):\d+\)/) || line.match(/at ()(.+):(\d+):\d+/);
    if (!match) 
		return line.replace(/^at /, "");
    const fn = match[1] || "[unknown]";
    const file = path.basename(match[2] ?? "[unknown]");
    const ln = match[3];
    return fn ? `${fn} (${file}:${ln})` : `${file}:${ln}`;
  }
 
  private write(line: string): void {
    if (this.stdout) process.stdout.write(line + "\n");
    if (this.fileStream) this.fileStream.write(line + "\n");
  }

  private log(level: LogLevel, msg: string): void {
	  if (LEVELS[level] < LEVELS[this.level]) return;
	  const line = `level=${level} ts=${this.timestamp()} caller=${this.caller()} msg=${msg}`;
	  this.write(line);
  }
 
  debug(msg: string): void { this.log("debug", msg); }
  info(msg: string): void  { this.log("info",  msg); }
  warn(msg: string): void  { this.log("warn",  msg); }
  error(msg: string): void { this.log("error", msg); }
 
  close(): void {
    this.fileStream?.end();
    this.fileStream = null;
  }

  public httpLogger(req: Request, res: Response, next: NextFunction){
	const start = process.hrtime.bigint();
	res.on("finish", () => {
		const durationMs =
			Number(process.hrtime.bigint() - start) / 1_000_000;

		this.info(
			`${req.method} ${req.originalUrl} status=${res.statusCode} duration=${durationMs.toFixed(2)}ms ip=${req.ip}`
		);
	});
	next();
  }
}

