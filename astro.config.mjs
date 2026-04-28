import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import remarkGfm from "remark-gfm";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserSite = repositoryName.endsWith(".github.io");
const base = process.env.SITE_BASE ?? (repositoryName && !isUserSite ? `/${repositoryName}` : "/");

export default defineConfig({
  site: process.env.SITE_URL ?? "https://finnsson.co",
  base,
  output: "static",
  trailingSlash: "ignore",
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkGfm],
    shikiConfig: {
      theme: "github-light"
    }
  }
});
