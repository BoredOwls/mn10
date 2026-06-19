import { z } from "zod";
import { BadRequestError } from "../common/api-error";

const createProjectSchema = z.object({
    title: z.string().min(1, "title_required").max(100, "title_too_long"),
    description: z.string().max(500, "description_too_long").optional(),
});

const parseCreateProject = (body: unknown) => {
    const result = createProjectSchema.safeParse(body);
    if (!result.success) {
        throw new BadRequestError(result.error.errors[0]?.message ?? "invalid_project_params");
    }
    return result.data;
};

export const ProjectValidation = { parseCreateProject };
