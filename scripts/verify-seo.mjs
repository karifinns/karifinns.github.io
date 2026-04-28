import { execFile as execFileCallback } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const distDir = path.resolve("dist");

const articleFile = path.join(distDir, "writing", "sumar-er-ekki-othroskad-haust", "index.html");
const writingIndexFile = path.join(distDir, "writing", "index.html");
const sitemapFile = path.join(distDir, "sitemap.xml");
const robotsFile = path.join(distDir, "robots.txt");

async function curlFile(filePath) {
  const url = pathToFileURL(filePath).href;
  const { stdout } = await execFile("curl", ["-L", url], {
    maxBuffer: 5 * 1024 * 1024
  });

  return stdout;
}

function assertIncludes(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(message);
  }
}

const articleHtml = await curlFile(articleFile);
assertIncludes(articleHtml, "Sumar er ekki óþroskað haust", "Article HTML is missing the title.");
assertIncludes(
  articleHtml,
  "Ef það er einhver einn",
  "Article HTML is missing meaningful article body text."
);

const writingIndexHtml = await curlFile(writingIndexFile);
assertIncludes(writingIndexHtml, "Skrif", "Writing index HTML is missing its heading.");
assertIncludes(
  writingIndexHtml,
  "Sumar er ekki óþroskað haust",
  "Writing index HTML is missing article links."
);

const sitemapXml = await curlFile(sitemapFile);
assertIncludes(
  sitemapXml,
  "https://finnsson.co/writing/sumar-er-ekki-othroskad-haust/",
  "Sitemap is missing the expected article URL."
);

const robotsTxt = await curlFile(robotsFile);
assertIncludes(
  robotsTxt,
  "https://finnsson.co/sitemap.xml",
  "robots.txt is missing the expected sitemap reference."
);

console.log("SEO verification passed.");
