import { and, eq, ilike } from "drizzle-orm";
import { db } from "../db";
import { organizations } from "../db/schema/organization-schema";
import type { Organization } from "../types/organization-types";
import type { GithubOrgBrief } from "../types/github-types";
import { InternalError, ConflictError } from "../common/api-error";

async function registerOrg(org: GithubOrgBrief): Promise<Organization> {
	const existing = await db.query.organizations.findFirst({
		where: eq(organizations.name, org.name!),
	})
	if (existing) {
		if (existing.isActive)
			throw new ConflictError("organization_already_exists")
		const [reactivated] = await db.update(organizations).set({ isActive: true })
				.where(eq(organizations.id, existing.id)).returning()
		if (!reactivated)
			throw new InternalError("organization_reactivation_failed")
		return reactivated
	}
	const [savedOrgObject] = await db.insert(organizations).values({
		id: org.id.toString(), name: org.name!
	}).returning()
	if (!savedOrgObject)
		throw new InternalError("organization_registration_failed")
	return savedOrgObject
}


async function unregisterOrg(org: GithubOrgBrief): Promise<boolean> {
	const delstat = await db.delete(organizations)
		.where(and( eq(organizations.id, org.id.toString()), eq(organizations.isActive, true) ));
	if(!delstat)
		throw new InternalError("organization_deletion_failed")
	return true;
}


async function getActiveOrgByName(name: string): Promise<Organization | undefined> {
	return db.query.organizations.findFirst({
		where: and(ilike(organizations.name, name), eq(organizations.isActive, true)),
	})
}


export const organizationRepository = {
	registerOrg,
	unregisterOrg,
	getActiveOrgByName,
}
