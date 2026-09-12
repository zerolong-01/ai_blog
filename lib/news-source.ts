import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_BYTES = 2 * 1024 * 1024;
const MIN_ARTICLE_LENGTH = 500;

export type NewsSource = {
  url: string;
  title: string;
  publisher: string;
  publishedAt?: string;
  text: string;
};

export class NewsSourceError extends Error {
  readonly code: "INVALID_URL" | "FETCH_FAILED" | "EXTRACTION_FAILED";

  constructor(code: "INVALID_URL" | "FETCH_FAILED" | "EXTRACTION_FAILED", message: string) {
    super(message);
    this.code = code;
  }
}

function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase().split("%")[0];
  if (normalized === "::1" || normalized === "::" || normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  const ipv4 = mapped || (isIP(normalized) === 4 ? normalized : "");
  if (!ipv4) return false;
  const [a, b] = ipv4.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

export async function validatePublicNewsUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new NewsSourceError("INVALID_URL", "Enter a valid HTTPS news URL.");
  }
  if (url.protocol !== "https:" || (url.port && url.port !== "443") || !url.hostname || url.username || url.password) {
    throw new NewsSourceError("INVALID_URL", "Only public HTTPS URLs on the standard port are allowed.");
  }
  if (url.hostname === "localhost" || url.hostname.endsWith(".localhost")) {
    throw new NewsSourceError("INVALID_URL", "Local and private network addresses are not allowed.");
  }
  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(url.hostname, { all: true, verbatim: true });
  } catch {
    throw new NewsSourceError("FETCH_FAILED", "The source hostname could not be resolved.");
  }
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new NewsSourceError("INVALID_URL", "Local and private network addresses are not allowed.");
  }
  url.hash = "";
  return url;
}

function decodeHtml(value: string) {
  const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
    if (entity.startsWith("#")) {
      const hex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : " ";
    }
    return entities[entity.toLowerCase()] || " ";
  });
}

function meta(html: string, keys: string[]) {
  for (const key of keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i")
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern)?.[1];
      if (match) return decodeHtml(match.trim());
    }
  }
  return "";
}

export function extractNewsSource(html: string, url: string): NewsSource {
  const title = meta(html, ["og:title", "twitter:title"]) || decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "");
  const publisher = meta(html, ["og:site_name", "application-name"]) || new URL(url).hostname.replace(/^www\./, "");
  const publishedAt = meta(html, ["article:published_time", "datePublished", "date"]);
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  const text = decodeHtml(article
    .replace(/<(script|style|noscript|svg|nav|footer|form|aside)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/p>|<\/h[1-6]>|<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
  const blocked = /sign in to continue|subscribe to continue|enable javascript to continue|access denied/i.test(text.slice(0, 1200));
  if (blocked || text.length < MIN_ARTICLE_LENGTH) {
    throw new NewsSourceError("EXTRACTION_FAILED", "The article body could not be extracted. Paste the article text and try again.");
  }
  return { url, title: title.slice(0, 300), publisher: publisher.slice(0, 200), publishedAt: publishedAt || undefined, text: text.slice(0, 100_000) };
}

export async function fetchNewsSource(value: string): Promise<NewsSource> {
  let current = await validatePublicNewsUrl(value);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    let response: Response;
    try {
      response = await fetch(current, { redirect: "manual", signal: AbortSignal.timeout(10_000), headers: { "User-Agent": "StackedAI-NewsImporter/1.0", Accept: "text/html,text/plain" } });
    } catch {
      throw new NewsSourceError("FETCH_FAILED", "The news source could not be downloaded.");
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new NewsSourceError("FETCH_FAILED", "The source redirected too many times.");
      current = await validatePublicNewsUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new NewsSourceError("FETCH_FAILED", `The news source returned HTTP ${response.status}.`);
    const type = response.headers.get("content-type")?.toLowerCase() || "";
    if (!type.includes("text/html") && !type.includes("text/plain")) throw new NewsSourceError("FETCH_FAILED", "The source is not an HTML or text article.");
    const declared = Number(response.headers.get("content-length") || 0);
    if (declared > MAX_BYTES) throw new NewsSourceError("FETCH_FAILED", "The source article is too large.");
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) throw new NewsSourceError("FETCH_FAILED", "The source article is too large.");
    return extractNewsSource(new TextDecoder().decode(bytes), current.toString());
  }
  throw new NewsSourceError("FETCH_FAILED", "The source could not be downloaded.");
}
