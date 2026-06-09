import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./api-error";
import { ApiResponse } from "./api-response";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(ApiResponse.fail(err.message));
    return;
  }
  res.status(500).json(ApiResponse.fail("internal server error"));
}
