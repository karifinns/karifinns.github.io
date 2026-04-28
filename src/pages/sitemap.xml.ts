import { getCollection } from "astro:content";
import { siteUrl } from "../lib/site";
import { getVisibleWriting } from "../lib/writing";

function toIsoDate(value: Date) {
  return value.toISOString();
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const entries = getVisibleWriting(await getCollection("writing"));
  const latestWritingDate = entries.reduce<Date | undefined>((latest, entry) => {
    const candidate = entry.data.updatedDate ?? entry.data.publishDate;

    if (!latest || candidate > latest) {
      return candidate;
    }

    return latest;
  }, undefined);

  const staticPages = [
    { path: "/", lastModified: latestWritingDate },
    { path: "/writing/", lastModified: latestWritingDate },
    { path: "/about/" },
    { path: "/projects/" },
    { path: "/rss.xml", lastModified: latestWritingDate }
  ];

  const articlePages = entries.map((entry) => ({
    path: `/writing/${entry.slug}/`,
    lastModified: entry.data.updatedDate ?? entry.data.publishDate
  }));

  const urls = [...staticPages, ...articlePages];
  const body = urls
    .map(({ path, lastModified }) => {
      const loc = new URL(path, siteUrl).href;

      return [
        "<url>",
        `<loc>${escapeXml(loc)}</loc>`,
        lastModified ? `<lastmod>${toIsoDate(lastModified)}</lastmod>` : "",
        "</url>"
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8"
      }
    }
  );
}
