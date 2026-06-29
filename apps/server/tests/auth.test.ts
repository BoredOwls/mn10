//Tets for auth APIs
import { expect, test, beforeAll, afterAll, setDefaultTimeout } from "bun:test"
import { init } from "./_init.test"
setDefaultTimeout(60_000);


beforeAll(async ()=>{
	await init.setup()
})

afterAll(async ()=>{
	await init.teardown()
})




test("login with PAT and fetch session", async () => {
	const baseUrl = "http://localhost:8080";
	const pat = process.env.GH_PAT_TOKEN!;
	if (pat == '' || pat == undefined)
		throw Error("github PAT env: GH_PAT_TOKEN not defined")
			

	const loginRes = await fetch(`${baseUrl}/auth/login/pat`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ pat: pat }),
	});
	expect(loginRes.ok).toBe(true);

	const setCookie = loginRes.headers.get("set-cookie");
	expect(setCookie).not.toBeNull();

	const sessionCookie = setCookie!.split(",").find((c) => 
			c.trim().startsWith("session="))?.split(";")[0];
	expect(sessionCookie).toBeDefined();

	//fetch session
	const sessionRes = await fetch(`${baseUrl}/auth/session/`, {
		headers: {
			Cookie: sessionCookie!,
			"Content-Type": "application/json",
		},
	});

	expect(sessionRes.ok).toBe(true);

	const body : any = await sessionRes.json();
	expect(body.success).toBe(true);
	expect(body.message).toBe("ok");
	expect(body.data).toBeDefined();
})



