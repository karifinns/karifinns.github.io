import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserSite = repositoryName.endsWith(".github.io");
const base = process.env.SITE_BASE ?? (repositoryName && !isUserSite ? `/${repositoryName}` : "/");

export default defineConfig({
  site: process.env.SITE_URL ?? "https://karifinns.github.io",
  base,
  output: "static",
  trailingSlash: "ignore",
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: "github-light"
    }
  }
});
