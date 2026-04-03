import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { siteDescription, siteTitle, withBase } from "../lib/site";
import { getVisibleWriting } from "../lib/writing";

export async function GET(context) {
  const entries = getVisibleWriting(await getCollection("writing"));

  return rss({
    title: siteTitle,
    description: siteDescription,
    site: context.site,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishDate,
      link: withBase(`/writing/${entry.slug}/`)
    })),
    customData: `<language>is</language>`
  });
}
