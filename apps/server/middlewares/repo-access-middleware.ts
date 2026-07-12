import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../common/api-error";
import { organizationRepository } from "../repositories/organization-repository";

export const requireRepoAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const owner = req.params.owner! as string;
        if (!owner) 
			throw new ForbiddenError("owner_missing");

        if (owner.toLowerCase() === req.user!.name.toLowerCase()) {
            next();
            return;
        }

        const org = await organizationRepository.getActiveOrgByName(owner);
        if (!org) throw new ForbiddenError("organization_not_registered");

        next();
    } catch (error) {
        next(error);
    }
};
