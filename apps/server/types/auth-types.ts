import type { account, sessions, users } from "../db/schema/auth-schema";

export type User = typeof users.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Session = typeof sessions.$inferSelect;

export interface CallbackParams {
    code: string;
    state: string;
    cookieState: string;
}

export interface UpsertUserParams {
    id: string;
    email: string;
    name: string;
    image: string;
}

export interface UpsertAccountParams {
    userId: string;
    githubId: number;
    accessToken: string;
}

export interface LoginResult {
    state: string;
    redirectUrl: string;
}

export interface SessionResult {
    user: typeof users.$inferSelect;
}
