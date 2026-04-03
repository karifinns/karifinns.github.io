export function GET({ site }) {
  const sitemapUrl = new URL(`${import.meta.env.BASE_URL}sitemap-index.xml`, site);

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
