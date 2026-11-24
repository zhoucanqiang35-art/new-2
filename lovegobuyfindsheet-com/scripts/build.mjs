import {existsSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const upstream = fileURLToPath(new URL("../../", import.meta.url));

function run(command, args) {
  const result = spawnSync(command, args, {cwd: root, stdio: "inherit"});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const refreshCatalog = !existsSync(join(root, "public/data/catalog.json"));
if (refreshCatalog) {
  run("python3", ["scripts/prepare-catalog.py", upstream]);
}
if (refreshCatalog || !["visual-coverage.json", "visual-photos.json", "visual-index.bin"]
  .every(file => existsSync(join(root, "public/data", file)))) {
  const sourceData = join(upstream, "litbuysheetlab-com/public/data");
  run("python3", ["scripts/build-visual-index.py",
    join(sourceData, "image-index-1.json"),
    join(sourceData, "image-index-2.json"),
    "--supplement", join(root, "scripts/image-supplement.json.gz"),
    "--offline",
  ]);
}
const locales = readdirSync(join(root,"public/locales")).filter(file => file.endsWith(".json") && file !== "en.json");
if (refreshCatalog || locales.some(file => !existsSync(join(root,"public/product-locales",file)))) {
  run("python3", ["scripts/prepare-product-locales.py", upstream]);
}
run("astro", ["build"]);
