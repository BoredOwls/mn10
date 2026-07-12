//Tets for repo APIs
//
import { afterAll, beforeAll, expect, test, setDefaultTimeout } from "bun:test";
import { init } from "./_init.test";

const baseUrl = "http://localhost:8080";

const pat = process.env.GH_PAT_TOKEN!;
const owner = process.env.GH_OWNER!;
const repo = process.env.GH_REPO!;
const org = process.env.GH_ORG!;


function requireEnv(name: string, value: string | undefined) {
	if (value == "" || value == undefined)
		throw Error(`github env: ${name} not defined`);
}

requireEnv("GH_PAT_TOKEN", pat);
requireEnv("GH_OWNER", owner);
requireEnv("GH_REPO", repo);
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

async function getRaw(path: string): Promise<{ status: number; body: any }> {
	const res = await fetch(`${baseUrl}${path}`, {
		headers: {
			Cookie: sessionCookie,
			"Content-Type": "application/json",
		},
	});
	const body: any = await res.json();
	return { status: res.status, body };
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

//list APIs
test("GET /repo", async () => {
	const repos = await get("/repo");
	expect(Array.isArray(repos)).toBe(true);
});

test("GET /repo/:owner for the caller's own account", async () => {
	const repos = await get(`/repo/${owner}`);
	expect(Array.isArray(repos)).toBe(true);
});

test("GET /repo/:owner/:repo/issues", async () => {
	const issues = await get(`/repo/${owner}/${repo}/issues`);
	expect(Array.isArray(issues)).toBe(true);
});

test("GET /repo/:owner/:repo/pr", async () => {
	const prs = await get(`/repo/${owner}/${repo}/pr`);
	expect(Array.isArray(prs)).toBe(true);
});

//org access gating
test("GET /repo/:owner for an unregistered org is forbidden", async () => {
	const { status, body } = await getRaw(`/repo/${org}`);
	expect(status).toBe(403);
	expect(body.success).toBe(false);
});

test("GET /repo/:owner for a random owner that is neither the caller nor a registered org is forbidden", async () => {
	const { status, body } = await getRaw(`/repo/definitely-not-a-real-owner-xyz`);
	expect(status).toBe(403);
	expect(body.success).toBe(false);
});

test("POST /org/:org_name registers the org", async () => {
	const { status, body } = await post(`/org/${org}`);
	expect(status).toBe(200);
	expect(body.success).toBe(true);
});

test("GET /repo/:owner for a registered active org succeeds", async () => {
	const repos = await get(`/repo/${org}`);
	expect(Array.isArray(repos)).toBe(true);
});
