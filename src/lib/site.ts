export const siteUrl = "https://finnsson.co";
export const siteTitle = "Kári Finnsson";
export const siteTagline = "Dansað um arkitektúr.";
export const siteDescription =
  "Skrif, verkefni og glósur eftir Kára Finnsson, sett fram á hljóðlátan og lesvænan hátt.";

export const navigation = [
  { href: "/writing", label: "Skrif" },
  { href: "/projects", label: "Verkefni" },
  { href: "/about", label: "Um mig" }
];

export function withBase(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");

  if (!base) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `${base}/`;
  }

  return `${base}${normalizedPath}`;
}
