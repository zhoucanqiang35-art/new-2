import {existsSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const upstream = fileURLToPath(new URL("../../", import.meta.url));

function run(command, args) {
  const result = spawnSync(command, args, {cwd: root, stdio: "inherit"});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(new URL("../public/data/catalog.json", import.meta.url))) {
  run("python3", ["scripts/prepare-catalog.py", upstream]);
}
run("astro", ["build"]);
