/*
 * Standardised API response envelope.
 *
 * usage:
 *   res.status(201).json(ApiResponse.ok("user created", user));
 *   res.status(200).json(ApiResponse.ok("ok"));
 *   res.status(400).json(ApiResponse.fail("invalid email"));
 */

export class ApiResponse<T = undefined> {
  readonly success: boolean;
  readonly message: string;
  readonly data?: T;

  private constructor(success: boolean, message: string, data?: T) {
    this.success = success;
    this.message = message;
    if (data !== undefined) this.data = data;
  }

  static ok<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static fail(message: string): ApiResponse<never> {
    return new ApiResponse(false, message);
  }
}
