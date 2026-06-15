import type { Request, Response } from "express";
import { asyncHandler } from "../common/async-handler";
import { AuthService } from "../services/auth-service";
import { UnauthorizedError } from "../common/api-error";

import type { CallbackParams } from "../types/auth-types";
import { env } from "../config/env";
import { ApiResponse } from "../common/api-response";
import { AuthValidation } from "../validators/auth-validation";

const login = async (req: Request, res: Response) => {
    const { state, redirectUrl } = AuthService.login();
    res.cookie("oauth_state", state, { httpOnly: true, sameSite: "lax" });
    res.redirect(redirectUrl);
};

const callback = async (req: Request, res: Response) => {
    const { code, state } = req.query;

    const params: CallbackParams = {
        code: code as string,
        state: state as string,
        cookieState: req.cookies.oauth_state,
    };

    const validated = AuthValidation.parseCallback(params);
    const sessionToken = await AuthService.callback(validated);

    res.clearCookie("oauth_state");
    res.cookie("session", sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: env.nodeEnv !== "development",
    });

    res.redirect(env.frontend.afterAuthRedirectUrl);
};

const getSession = async (req: Request, res: Response) => {
    const token = req.cookies?.session;
    if (!token) throw new UnauthorizedError();

    const session = await AuthService.getSession(token);
    res.json(ApiResponse.ok("ok", session));
};

const logout = async (req: Request, res: Response) => {
    const token = req.cookies?.session;
    if (!token) throw new UnauthorizedError();

    await AuthService.logout(token);
    res.clearCookie("session");
    res.json(ApiResponse.ok("logged out"));
};

export const authController = {
    login: asyncHandler(login),
    callback: asyncHandler(callback),
    getSession: asyncHandler(getSession),
    logout: asyncHandler(logout),
};
