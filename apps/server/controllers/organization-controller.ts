import type { Request, Response } from "express";
import { asyncHandler } from "../common/async-handler";
import { ApiResponse } from "../common/api-response";
import { UnauthorizedError } from "../common/api-error";
import { organizationService } from "../services/organization-service";
import { OrganizationValidation } from "../validators/organization-validation";


async function listUser_organizations(req: Request, res: Response){
	const githubToken = req.githubToken
	if(!githubToken)
		throw new UnauthorizedError("missing_oauth_credentials");
	const result = await organizationService.listUser_organizations(githubToken)
	res.json(ApiResponse.ok("ok", result));
}

async function checkUser_organizationRole(req: Request, res: Response){
	const githubToken = req.githubToken
	if(!githubToken)
		throw new UnauthorizedError("missing_oauth_credentials");
	const { org_name } = OrganizationValidation.parseOrgNameParam(req.params)
	const result = await organizationService.checkUser_organizationRole(githubToken, org_name)
	res.json(ApiResponse.ok("ok", result));
}


async function registerOrganization(req: Request, res: Response) {
	const githubToken = req.githubToken
	if(!githubToken)
		throw new UnauthorizedError("missing_oauth_credentials");
	const { org_name } = OrganizationValidation.parseOrgNameParam(req.params)

	const result = await organizationService.registerOrganization(githubToken, org_name)
	res.json(ApiResponse.ok("ok", result))
}

async function unregisterOrganization(req: Request, res: Response) {
	const githubToken = req.githubToken
	if(!githubToken)
		throw new UnauthorizedError("missing_oauth_credentials");
	const { org_name } = OrganizationValidation.parseOrgNameParam(req.params)

	const result = await organizationService.unregisterOrganization(githubToken, org_name)
	res.json(ApiResponse.ok("ok", result))
}


export const organizationController = {
	listUser_organizations: asyncHandler(listUser_organizations),
	checkUser_organizationRole: asyncHandler(checkUser_organizationRole),
	registerOrganization: asyncHandler(registerOrganization),
	unregisterOrganization: asyncHandler(unregisterOrganization)
}
