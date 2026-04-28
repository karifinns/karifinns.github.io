import { siteUrl } from "../lib/site";

export function GET() {
  const sitemapUrl = new URL("/sitemap.xml", siteUrl);

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
