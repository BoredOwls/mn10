import { and, eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "../db";
import { projects } from "../db/schema/project-schema";
import type { CreateProjectParams, Project } from "../types/project-types";
import { InternalError } from "../common/api-error";

const createProject = async (params: CreateProjectParams): Promise<Project> => {
    const [saved] = await db
        .insert(projects)
        .values({
            id: randomBytes(16).toString("hex"),
            title: params.title,
            description: params.description ?? null,
            userId: params.userId,
        })
        .returning();

    if (!saved) throw new InternalError("project_creation_failed");
    return saved;
};

const getProjectsByUserId = async (userId: string): Promise<Project[]> => {
    return db
        .select()
        .from(projects)
        .where(and(eq(projects.userId, userId), eq(projects.isActive, true)));
};

const getProjectById = async (id: string): Promise<Project | null> => {
    const [found] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.isActive, true)))
        .limit(1);
    return found ?? null;
};

const deleteProject = async (id: string): Promise<void> => {
    await db
        .update(projects)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(projects.id, id), eq(projects.isActive, true)));
};

export const ProjectRepository = { createProject, getProjectsByUserId, getProjectById, deleteProject };
