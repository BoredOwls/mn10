
import type { CookieOptions, Request, Response } from "express";
import { asyncHandler } from "../common/async-handler";
import { AuthService } from "../services/auth-service";
import { UnauthorizedError } from "../common/api-error";

import type { CallbackParams } from "../types/auth-types";
import { env } from "../config/env";
import { ApiResponse } from "../common/api-response";
import { AuthValidation } from "../validators/auth-validation";


const oauthLogin = async (req: Request, res: Response) => {
    const { clientId, clientSecret } = AuthValidation.parseOAuthLogin(req.body);
    const { state, redirectUrl } = AuthService.oauthLogin(clientId);

	let cookieConfig : CookieOptions = {
		httpOnly: true,
        sameSite: "lax",
		//5 mins
        maxAge:   (1000 * 60) * 5,
        secure:   env.nodeEnv !== "development",
	}

	//!WARN: client side secrets sharing with cookies is not a good idea in the long run, 
		// having a mem. buffer/db/cache handle it or jwt token should be taken up later on for better security
    res.cookie("oauth_state", state, cookieConfig);
    res.cookie("oauth_client_id", clientId, cookieConfig);
    res.cookie("oauth_client_secret", clientSecret, cookieConfig);
 
    res.redirect(redirectUrl);
};

const patLogin = async (req: Request, res: Response) => {
    const { pat } = AuthValidation.parsePatLogin(req.body);
    const sessionToken = await AuthService.patLogin(pat);
 
    res.cookie("session", sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge:   30 * 24 * 60 * 60 * 1000,
        secure:   env.nodeEnv !== "development",
    });
 
    res.json(ApiResponse.ok("logged_in"));
};

const callback = async (req: Request, res: Response) => {
    const { code, state } = req.query;
	const clientId     = req.cookies.oauth_client_id;
    const clientSecret = req.cookies.oauth_client_secret;
	if (!clientId || !clientSecret) 
		throw new UnauthorizedError("missing_oauth_credentials");

    const params: CallbackParams = {
        code: code as string,
        state: state as string,
        cookieState: req.cookies.oauth_state,
    };

    const validated = AuthValidation.parseCallback(params);
    const sessionToken = await AuthService.callback(validated, clientId, clientSecret);

    res.clearCookie("oauth_state");
	res.clearCookie("oauth_client_id");
    res.clearCookie("oauth_client_secret");

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

const checkOrgMembership = async (req: Request, res: Response) => {
    const { org } = AuthValidation.parseMembershipCheck(req.query);
    const result = await AuthService.checkOrgMembership(org, req.githubToken!);
    res.json(ApiResponse.ok("ok", result));
};

export const authController = {
    oauthLogin: asyncHandler(oauthLogin),
	patLogin:   asyncHandler(patLogin),
    callback: asyncHandler(callback),
    getSession: asyncHandler(getSession),
    logout: asyncHandler(logout),
    checkOrgMembership: asyncHandler(checkOrgMembership),
};
