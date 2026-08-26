import type { NextFunction, Request, Response } from "express";
import type { users } from "../db/schema/auth-schema";
import { UnauthorizedError } from "../common/api-error";
import { AuthRepository } from "../repositories/auth-repository";
import { log } from "../global";

declare global {
    namespace Express {
        interface Request {
            user?: typeof users.$inferSelect;
            githubToken?: string;
        }
    }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.session;
        if (!token) throw new UnauthorizedError();

        const sess = await AuthRepository.getSessionByToken(token);
        if (!sess) throw new UnauthorizedError("session_not_found");
        if (sess.expiresAt < new Date()) throw new UnauthorizedError("session_expired");

        const currentUser = await AuthRepository.getUserById(sess.userId);
        if (!currentUser) throw new UnauthorizedError("user_not_found");

        const acc = await AuthRepository.getAccountByUserId(currentUser.id);
        if (!acc?.accessToken) throw new UnauthorizedError("github_auth_missing");

        req.user = currentUser;
        req.githubToken = acc.accessToken;

        next();
    } catch (error) {
        next(error);
    }
};
