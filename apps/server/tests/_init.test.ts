import { $ } from "bun";

const SERVER_PORT = 8080;
const DB_PORT = 1930;
const DB_USER = "test";
const DB_PASS = "test";
const DB_NAME = "test";

const CONTAINER = "repo-api-test-db";
const PG_IMAGE = "postgres:16";

const DATABASE_URL =
	`postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:${DB_PORT}/${DB_NAME}`;

let serverProc: Bun.Subprocess | null = null;
let startedServer = false;
let startedDb = false;

async function portOpen(port: number): Promise<boolean> {
	try {
		await $`bash -c "echo > /dev/tcp/127.0.0.1/${port}"`.quiet();
		return true;
	} catch {
		return false;
	}
}

async function waitForPort(port: number, timeoutMs = 30000) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		if (await portOpen(port))
			return;

		if (serverProc && serverProc.exitCode !== null)
			throw new Error(`Server exited with code ${serverProc.exitCode}`);

		await Bun.sleep(250);
	}
	throw new Error(`Timed out waiting for port ${port}`);
}


export async function setup() {
	if (await portOpen(SERVER_PORT))
		return;
	//db setup
	await $`docker rm -f ${CONTAINER}`.nothrow();
	const dbProc = Bun.spawn([
		"docker", "run", "-d", "--name", CONTAINER,
		"-e", `POSTGRES_USER=${DB_USER}`,
		"-e", `POSTGRES_PASSWORD=${DB_PASS}`,
		"-e", `POSTGRES_DB=${DB_NAME}`,
		"-p", `${DB_PORT}:5432`, 
		PG_IMAGE,
	]);
	if ((await dbProc.exited) !== 0)
		throw new Error("Failed to start PostgreSQL container");
	startedDb = true;

	await Bun.sleep(2000);

	//db migrations
	const migrateProc = Bun.spawn(["npm", "run", "db:migrate"], {
		stdout: "inherit",
		stderr: "inherit",
		env: {
			...process.env,
			DATABASE_URL,
		},
	});
	if ((await migrateProc.exited) !== 0)
		throw new Error("Failed to run database migrations");
	//run server (if not already)
	serverProc = Bun.spawn(["bun", "run", "main.ts"], {
		stdout: "inherit",
		stderr: "inherit",
		env: {
			...process.env,
			DATABASE_URL,
		},
	});
	startedServer = true;
	await waitForPort(SERVER_PORT);
}


export async function teardown() {
	if (startedServer && serverProc) {
		serverProc.kill();
		await serverProc.exited;
	}
	if (startedDb)
		await $`docker rm -f ${CONTAINER}`.nothrow();
}

export const init = {
	setup,
	teardown,
};
