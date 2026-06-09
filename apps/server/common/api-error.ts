/*
 * HTTP-aware error classes.
 *
 * usage:
 *   throw new NotFoundError("user not found");
 *   throw new BadRequestError("invalid email");
 *   throw new ApiError(418, "i'm a teapot");
 */

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "bad request") {
    super(400, message);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message = "conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
}

export class InternalError extends ApiError {
  constructor(message = "internal server error") {
    super(500, message);
    this.name = "InternalError";
  }
}
