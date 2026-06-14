import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { account, sessions, users } from "../db/schema/auth-schema";
import type { Account, Session, UpsertAccountParams, UpsertUserParams, User } from "../types/auth-types";
import { randomBytes } from "crypto";
import { InternalError } from "../common/api-error";

const upsertUser = async (params: UpsertUserParams): Promise<User> => {
    const [saved] = await db
        .insert(users)
        .values({
            id: params.id,
            name: params.name,
            email: params.email,
            image: params.image,
            emailVerified: true,
        })
        .onConflictDoUpdate({
            target: users.id,
            set: {
                name: params.name,
                image: params.image,
            },
        })
        .returning();

    if (!saved) throw new InternalError("user_creation_failed");
    return saved;
};

const upsertAccount = async (params: UpsertAccountParams): Promise<Account> => {
    const [saved] = await db
        .insert(account)
        .values({
            id: `github_${params.githubId}`,
            accountId: String(params.githubId),
            provider: "github",
            userId: params.userId,
            accessToken: params.accessToken,
        })
        .onConflictDoUpdate({
            target: account.id,
            set: {
                accessToken: params.accessToken,
            },
        })
        .returning();

    if (!saved) throw new InternalError("account_creation_failed");
    return saved;
};

const getUserById = async (userId: string): Promise<User | null> => {
    const [found] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, userId), eq(users.isActive, true)))
        .limit(1);
    return found ?? null;
};

const getAccountByUserId = async (userId: string): Promise<Account | null> => {
    const [found] = await db
        .select()
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.isActive, true)))
        .limit(1);
    return found ?? null;
};

const createSession = async (userId: string): Promise<string> => {
    const token = randomBytes(32).toString("hex");
    const [saved] = await db
        .insert(sessions)
        .values({
            id: randomBytes(16).toString("hex"),
            userId,
            token,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .returning();

    if (!saved) throw new InternalError("session_creation_failed");
    return token;
};

const getSessionByToken = async (token: string): Promise<Session | null> => {
    const [found] = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.token, token), eq(sessions.isActive, true)))
        .limit(1);
    return found ?? null;
};

const deleteSession = async (token: string): Promise<void> => {
    await db
        .delete(sessions)
        .where(and(eq(sessions.token, token), eq(sessions.isActive, true)));
};

export const AuthRepository = {
    upsertUser,
    upsertAccount,
    getUserById,
    getAccountByUserId,
    createSession,
    getSessionByToken,
    deleteSession,
};
