import { InternalError, UnauthorizedError } from "../common/api-error";
import type { GithubOrgRole, GithubOrgBrief } from "../types/github-types";
import type { GithubOrgMembership } from "../types/github-types";
import { organizationRepository } from "../repositories/organization-repository";
import type { Organization } from "../types/organization-types";
 

async function listUser_organizations(githubToken: string) : Promise<GithubOrgBrief[]>{
	const res : globalThis.Response  = await fetch("https://api.github.com/user/memberships/orgs", {
		headers: {
			Authorization: `Bearer ${githubToken}`,
			"User-Agent": "mn10-app",
		},
	});
    if (!res.ok) 
		throw new InternalError("failed_to_fetch_membership_orgs");

	let orgs : GithubOrgBrief[] = [];
	const orgsRaw : GithubOrgMembership[] = await res.json() as GithubOrgMembership[]
	for (const org of orgsRaw){
		orgs.push({
			id: org.organization.id,
			name: org.organization.login,
			state: org.state, 
			role: org.role,
		})
	} 
	return orgs;
}

async function checkUser_organizationRole(githubToken: string, orgName: string) : Promise<GithubOrgRole> {
	const userOrgs = await listUser_organizations(githubToken);
	let targetorg = userOrgs.find(org => org.name == orgName);
	if(targetorg) 
		return { role: targetorg.role }
	else
		return { role: null }
}

async function registerOrganization(githubToken: string, orgName: string) : Promise<Organization> {
	const orgs : GithubOrgBrief[] = await listUser_organizations(githubToken)
	let orgInfo = orgs.find(org => org.name == orgName)
	if(!orgInfo)
		throw new UnauthorizedError("organization_access_restricted")
	const savedOrg = await organizationRepository.registerOrg(orgInfo)
	return savedOrg;
}

async function unregisterOrganization(githubToken: string, orgName: string) : Promise<boolean> {
	const orgs : GithubOrgBrief[] = await listUser_organizations(githubToken)
	let orgInfo = orgs.find(org => org.name == orgName)
	if(!orgInfo)
		throw new UnauthorizedError("organization_access_restricted")

	const delstat = await organizationRepository.unregisterOrg(orgInfo)
	return delstat;
}


export const organizationService = {
	listUser_organizations,
	checkUser_organizationRole,
	registerOrganization,
	unregisterOrganization,
}
