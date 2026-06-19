import type { projects } from "../db/schema/project-schema";

export type Project = typeof projects.$inferSelect;

export interface CreateProjectParams {
    title: string;
    description?: string;
    userId: string;
}
