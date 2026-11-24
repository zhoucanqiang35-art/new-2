import { defineConfig } from "astro/config";
import { productionOrigin } from "./src/lib/seo.mjs";

export default defineConfig({
  site: process.env.CF_PAGES_BRANCH === "main" ? productionOrigin : undefined,
  trailingSlash: "always",
});

