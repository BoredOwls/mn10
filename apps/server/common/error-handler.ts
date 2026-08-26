import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./api-error";
import { ApiResponse } from "./api-response";
import { log } from "../global";

export function errorHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
): void {

	//debug mode shows verbose error
	if(process.env.DEBUG_MODE! == '1')
		log.error(`[ErrorType: ${err.name}] caused by ${err.cause} \nmessage: ${err.message || "none"}\n\n${err.stack}`);
	
	if (err instanceof ApiError) {
		res.status(err.statusCode).json(ApiResponse.fail(err.message));
		return;
	}
	res.status(500).json(ApiResponse.fail("internal server error"));
}
