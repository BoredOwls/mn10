import type { Request, Response } from "express";
import { asyncHandler } from "../common/async-handler";
import { ApiResponse } from "../common/api-response";
import { ProjectService } from "../services/project-service";
import { ProjectValidation } from "../validators/project-validation";

const createProject = async (req: Request, res: Response) => {
    const validated = ProjectValidation.parseCreateProject(req.body);
    const project = await ProjectService.createProject({
        title: validated.title,
        description: validated.description,
        userId: req.user!.id,
    });
    res.status(201).json(ApiResponse.ok("project_created", project));
};

const getProjects = async (req: Request, res: Response) => {
    const projects = await ProjectService.getProjects(req.user!.id);
    res.json(ApiResponse.ok("ok", projects));
};

const getProject = async (req: Request, res: Response) => {
    const project = await ProjectService.getProject(req.params.id, req.user!.id);
    res.json(ApiResponse.ok("ok", project));
};

const deleteProject = async (req: Request, res: Response) => {
    await ProjectService.deleteProject(req.params.id, req.user!.id);
    res.json(ApiResponse.ok("project_deleted"));
};

export const projectController = {
    createProject: asyncHandler(createProject),
    getProjects: asyncHandler(getProjects),
    getProject: asyncHandler(getProject),
    deleteProject: asyncHandler(deleteProject),
};
