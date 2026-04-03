import type { CollectionEntry } from "astro:content";

export function isPublished(entry: CollectionEntry<"writing">) {
  return !entry.data.draft || !import.meta.env.PROD;
}

export function sortWriting(entries: CollectionEntry<"writing">[]) {
  return [...entries].sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
  );
}

export function getVisibleWriting(entries: CollectionEntry<"writing">[]) {
  return sortWriting(entries.filter(isPublished));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("is-IS", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function slugifyTag(tag: string) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
