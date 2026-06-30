import { execSync } from "child_process";

const outDir = 'dist'
const linux_amd64_buildname = 'mn10-linux-amd64'
const darwin_arm64_buildname = 'mn10-darwin-arm64'


const buildAMD64 = `bun build main.ts --compile --target=bun-linux-x64 --outfile ${outDir}/${linux_amd64_buildname}`
const buildARM64 = `bun build main.ts --compile --target=bun-darwin-arm64 --outfile ${outDir}/${darwin_arm64_buildname}`

async function main() {
	execSync(`mkdir -p ${outDir}`)

	execSync(buildAMD64);
	console.log("Binary created successfully for Linux x86_64");

	execSync(buildARM64);
	console.log("Binary created successfully for Darwin ARM64");
}

main().catch(console.error);
