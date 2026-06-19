import { ForbiddenError, NotFoundError, UnauthorizedError } from "../common/api-error";
import { AuthRepository } from "../repositories/auth-repository";
import { ProjectRepository } from "../repositories/project-repository";
import type { CreateProjectParams, Project } from "../types/project-types";

const createProject = async (params: CreateProjectParams): Promise<Project> => {
    const user = await AuthRepository.getUserById(params.userId);
    if (!user) throw new UnauthorizedError("user_not_found");

    return ProjectRepository.createProject(params);
};

const getProjects = async (userId: string): Promise<Project[]> => {
    const user = await AuthRepository.getUserById(userId);
    if (!user) throw new UnauthorizedError("user_not_found");

    return ProjectRepository.getProjectsByUserId(userId);
};

const getProject = async (id: string, userId: string): Promise<Project> => {
    const project = await ProjectRepository.getProjectById(id);
    if (!project) throw new NotFoundError("project_not_found");
    if (project.userId !== userId) throw new ForbiddenError("project_access_denied");
    return project;
};

const deleteProject = async (id: string, userId: string): Promise<void> => {
    const project = await ProjectRepository.getProjectById(id);
    if (!project) throw new NotFoundError("project_not_found");
    if (project.userId !== userId) throw new ForbiddenError("project_access_denied");
    await ProjectRepository.deleteProject(id);
};

export const ProjectService = { createProject, getProjects, getProject, deleteProject };
