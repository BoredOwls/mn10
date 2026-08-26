import { z } from "zod";
import { BadRequestError } from "../common/api-error";

const orgNameParamSchema = z.object({
    org_name: z.string().min(1, "missing_org_name"),
});

const parseOrgNameParam = (params: unknown) => {
    const result = orgNameParamSchema.safeParse(params);
    if (!result.success) throw new BadRequestError(result.error.errors[0]?.message ?? "invalid_org_name");
    return result.data;
};

export const OrganizationValidation = { parseOrgNameParam };
