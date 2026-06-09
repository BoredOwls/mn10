import { ApiResponse } from "../common/api-response";
import { asyncHandler } from "../common/async-handler";
import { authService } from "../services/auth-service";

const register = asyncHandler(async (_req, res) => {
  const params = _req.body;

  await authService.regsiter(params);
  res.status(201).json(ApiResponse.ok("register ok"));
});

export const authController = { register };
