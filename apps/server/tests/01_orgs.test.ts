//Tests for organization APIs
//
import { afterAll, beforeAll, expect, test, setDefaultTimeout } from "bun:test";
import { init } from "./_init.test";

const baseUrl = "http://localhost:8080";

const pat = process.env.GH_PAT_TOKEN!;
const org = process.env.GH_ORG!;


function requireEnv(name: string, value: string | undefined) {
	if (value == "" || value == undefined)
		throw Error(`github env: ${name} not defined`);
}

requireEnv("GH_PAT_TOKEN", pat);
requireEnv("GH_ORG", org);
let sessionCookie: string;


setDefaultTimeout(60_000);

//auth to get session b4 running anything
beforeAll(async () => {
	await init.setup()
	const loginRes = await fetch(`${baseUrl}/auth/login/pat`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ pat }),
	});
	expect(loginRes.ok).toBe(true);
	const setCookie = loginRes.headers.get("set-cookie");
	expect(setCookie).not.toBeNull();

	sessionCookie = setCookie!.split(",").find((c) => c.trim().startsWith("session="))!.split(";")[0]!;
	expect(sessionCookie).toBeDefined();
});

afterAll(async ()=>{
	await init.teardown()
})


async function get(path: string): Promise<any> {
	const res = await fetch(`${baseUrl}${path}`, {
		headers: {
			Cookie: sessionCookie,
			"Content-Type": "application/json",
		},
	});
	expect(res.ok).toBe(true);
	const body: any = await res.json();
	expect(body.success).toBe(true);
	expect(body.message).toBe("ok");
	expect(body.data).toBeDefined();
	return body.data;
}

async function post(path: string): Promise<{ status: number; body: any }> {
	const res = await fetch(`${baseUrl}${path}`, {
		method: "POST",
		headers: {
			Cookie: sessionCookie,
			"Content-Type": "application/json",
		},
	});
	const body: any = await res.json();
	return { status: res.status, body };
}

async function del(path: string): Promise<{ status: number; body: any }> {
	const res = await fetch(`${baseUrl}${path}`, {
		method: "DELETE",
		headers: {
			Cookie: sessionCookie,
			"Content-Type": "application/json",
		},
	});
	const body: any = await res.json();
	return { status: res.status, body };
}


//list APIs
test("GET /org/list", async () => {
	const orgs = await get("/org/list");
	expect(Array.isArray(orgs)).toBe(true);
	expect(orgs.some((o: any) => o.name === org)).toBe(true);
});

test("GET /org/checkrole/:org_name for an org the user belongs to", async () => {
	const result = await get(`/org/checkrole/${org}`);
	expect(["admin", "member"]).toContain(result.role);
});

test("GET /org/checkrole/:org_name for an org the user does not belong to", async () => {
	const result = await get(`/org/checkrole/definitely-not-a-real-org-xyz`);
	expect(result.role).toBeNull();
});

//register/unregister flow
test("POST /org/:org_name registers the org", async () => {
	const { status, body } = await post(`/org/${org}`);
	expect(status).toBe(200);
	expect(body.success).toBe(true);
	expect(body.data.name).toBe(org);
});

test("POST /org/:org_name again returns conflict", async () => {
	const { status, body } = await post(`/org/${org}`);
	expect(status).toBe(409);
	expect(body.success).toBe(false);
});

test("POST /org/:org_name for an org the user has no access to is unauthorized", async () => {
	const { status, body } = await post(`/org/definitely-not-a-real-org-xyz`);
	expect(status).toBe(401);
	expect(body.success).toBe(false);
});

test("DELETE /org/:org_name unregisters the org", async () => {
	const { status, body } = await del(`/org/${org}`);
	expect(status).toBe(200);
	expect(body.success).toBe(true);
});

test("POST /org/:org_name after unregister reactivates the org", async () => {
	const { status, body } = await post(`/org/${org}`);
	expect(status).toBe(200);
	expect(body.success).toBe(true);
	expect(body.data.name).toBe(org);
	expect(body.data.isActive).toBe(true);
});
