import type { CallbackParams, LoginResult, SessionResult, UpsertAccountParams, UpsertUserParams } from "../types/auth-types";
import { env } from "../config/env";
import { randomBytes } from "crypto";
import { AuthValidation } from "../validators/auth-validation";
import { BadRequestError, InternalError, NotFoundError, UnauthorizedError } from "../common/api-error";
import type { GithubEmail, GithubTokenResponse, GithubUser } from "../types/github-types";
import { AuthRepository } from "../repositories/auth-repository";

const login = (): LoginResult => {
    const state = randomBytes(16).toString("hex");

    const params = new URLSearchParams({
        client_id: env.github.clientId,
        redirect_uri: `${env.github.baseUrl}/auth/callback`,
        scope: "read:user user:email repo",
        state,
    });

    return {
        state,
        redirectUrl: `https://github.com/login/oauth/authorize?${params}`,
    };
};

const callback = async (params: CallbackParams): Promise<string> => {
    if (params.state !== params.cookieState) {
        throw new BadRequestError("invalid_state");
    }

    const accessToken = await _getAccessTokenFromGithub(params.code);
    const ghUser = await _getGithubUser(accessToken);
    const email = ghUser.email ?? await _getGithubPrimaryEmail(accessToken);

    const upsertUserParams: UpsertUserParams = {
        id: ghUser.id.toString(),
        name: ghUser.login.toLocaleLowerCase(),
        email: email.toLocaleLowerCase(),
        image: ghUser.avatar_url,
    };

    const savedUser = await AuthRepository.upsertUser(upsertUserParams);
    if (!savedUser) throw new InternalError("authentication_failed");

    const upsertAccountParams: UpsertAccountParams = {
        userId: savedUser.id.toString(),
        githubId: ghUser.id,
        accessToken,
    };

    await AuthRepository.upsertAccount(upsertAccountParams);

    const sessionToken = await AuthRepository.createSession(savedUser.id.toString());
    return sessionToken;
};

const getSession = async (token: string): Promise<SessionResult> => {
    const session = await AuthRepository.getSessionByToken(token);
    if (!session) throw new UnauthorizedError("session_not_found");

    if (session.expiresAt < new Date()) {
        await AuthRepository.deleteSession(token);
        throw new UnauthorizedError("session_expired");
    }

    const user = await AuthRepository.getUserById(session.userId);
    if (!user) throw new NotFoundError("user_not_found");

    return { user };
};

const logout = async (token: string): Promise<void> => {
    const session = await AuthRepository.getSessionByToken(token);
    if (!session) throw new UnauthorizedError("session_not_found");
    await AuthRepository.deleteSession(token);
};


const _getAccessTokenFromGithub = async (code: string): Promise<string> => {
    const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            client_id: env.github.clientId,
            client_secret: env.github.clientSecret,
            code,
            redirect_uri: `${env.github.baseUrl}/auth/callback`,
        }),
    });

    const data = await res.json() as GithubTokenResponse;
    if (!data.access_token) throw new BadRequestError("github_token_exchange_failed");
    return data.access_token;
};

const _getGithubUser = async (accessToken: string): Promise<GithubUser> => {
    const res = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "mn10-app",
        },
    });

    if (!res.ok) throw new InternalError("failed_to_fetch_github_user");
    return res.json() as Promise<GithubUser>;
};

const _getGithubPrimaryEmail = async (accessToken: string): Promise<string> => {
    const res = await fetch("https://api.github.com/user/emails", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "mn10-app",
        },
    });

    if (!res.ok) throw new InternalError("failed_to_fetch_github_emails");

    const emails = await res.json() as GithubEmail[];

    const primary =
        emails.find(e => e.primary && e.verified)?.email
        ?? emails.find(e => e.primary)?.email
        ?? emails.find(e => e.verified)?.email
        ?? emails[0]?.email;

    if (!primary) throw new BadRequestError("no_verified_primary_email");
    return primary;
};

export const AuthService = {
    login,
    callback,
    getSession,
    logout,
};
