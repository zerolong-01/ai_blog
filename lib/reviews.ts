import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import matter from "gray-matter";

import { ToolCategory, ToolReview, ToolReviewMeta } from "@/lib/types";

let reviewMetaCache: Promise<ToolReviewMeta[]> | null = null;
const reviewContentCache = new Map<string, Promise<ToolReview | undefined>>();

type ReviewFrontmatter = Omit<ToolReviewMeta, "rating"> & {
  title?: string;
  rating: number | string;
};

type CreateReviewInput = Omit<ToolReviewMeta, "slug" | "updatedAt"> & {
  content: string;
  slug?: string;
  updatedAt?: string;
};

type GithubStorageConfig = {
  token: string;
  repo: string;
  branch: string;
  path: string;
};

type GithubContentEntry = {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
};

export type ReviewStorageStatus = {
  error: string | null;
  mode: "github" | "filesystem";
  target: string;
};

type GithubReadOptions = {
  suppressNotFound?: boolean;
};

function normalizeList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toToolReview(fileSlug: string, frontmatter: ReviewFrontmatter, content: string): ToolReview {
  const name = String(frontmatter.name || frontmatter.title || fileSlug);
  const summary =
    String(frontmatter.summary || "").trim() ||
    content
      .replace(/^#+\s+/gm, "")
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find(Boolean)
      ?.slice(0, 180) ||
    "";

  return {
    slug: String(frontmatter.slug || fileSlug),
    name,
    tagline: String(frontmatter.tagline || ""),
    category: (frontmatter.category as ToolCategory) || "general",
    website: String(frontmatter.website || ""),
    price: String(frontmatter.price || ""),
    rating: Number(frontmatter.rating || 0),
    summary,
    bestFor: normalizeList(frontmatter.bestFor),
    pros: normalizeList(frontmatter.pros),
    cons: normalizeList(frontmatter.cons),
    features: normalizeList(frontmatter.features),
    verdict: String(frontmatter.verdict || ""),
    updatedAt: String(frontmatter.updatedAt || new Date().toISOString().slice(0, 10)),
    content
  };
}

function toToolReviewMeta(review: ToolReview): ToolReviewMeta {
  const { content, ...meta } = review;
  void content;
  return meta;
}

function getBundledReviewsDirectory() {
  return path.join(process.cwd(), "content", "reviews");
}

function getRuntimeReviewsDirectory() {
  const configuredDirectory = process.env.REVIEW_STORAGE_DIR?.trim();

  if (!configuredDirectory) {
    return path.join(tmpdir(), "stacked-ai-reviews");
  }

  return path.isAbsolute(configuredDirectory)
    ? configuredDirectory
    : path.join(process.cwd(), configuredDirectory);
}

function getReadableDirectories() {
  const bundledDirectory = getBundledReviewsDirectory();
  const runtimeDirectory = getRuntimeReviewsDirectory();

  return bundledDirectory === runtimeDirectory ? [bundledDirectory] : [runtimeDirectory, bundledDirectory];
}

function getGithubStorageConfig(): GithubStorageConfig | null {
  const token = process.env.GITHUB_STORAGE_TOKEN?.trim();
  const repo = process.env.GITHUB_STORAGE_REPO?.trim();
  const branch = process.env.GITHUB_STORAGE_BRANCH?.trim();
  const storagePath = process.env.GITHUB_STORAGE_PATH?.trim();

  if (!token || !repo || token === "github_pat_xxx") {
    return null;
  }

  return {
    token,
    repo,
    branch: branch || "main",
    path: storagePath || "content/reviews"
  };
}

function isGithubStorageEnabled() {
  return getGithubStorageConfig() !== null;
}

function getGithubStorageConfigError() {
  const repo = process.env.GITHUB_STORAGE_REPO?.trim();
  const token = process.env.GITHUB_STORAGE_TOKEN?.trim();

  if (!repo && !token) {
    return null;
  }

  if (!repo) {
    return "GITHUB_STORAGE_REPO is missing.";
  }

  if (!token || token === "github_pat_xxx") {
    return "GITHUB_STORAGE_TOKEN is missing. Add a GitHub token with Contents read/write permission.";
  }

  return null;
}

export function getReviewStorageStatus(): ReviewStorageStatus {
  const githubStorageConfigError = getGithubStorageConfigError();
  const githubStorageConfig = getGithubStorageConfig();

  if (githubStorageConfig) {
    return {
      error: null,
      mode: "github",
      target: `${githubStorageConfig.repo}@${githubStorageConfig.branch}:${githubStorageConfig.path}`
    };
  }

  return {
    error: githubStorageConfigError,
    mode: "filesystem",
    target: process.env.REVIEW_STORAGE_DIR?.trim() || "runtime temp storage"
  };
}

async function parseGithubResponse<T>(response: Response) {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let message = `GitHub storage request failed with status ${response.status}.`;

  try {
    const error = (await response.json()) as { message?: string };

    if (error.message) {
      message = `GitHub storage error: ${error.message}`;
    }
  } catch {
    // Keep the fallback message when the response body is not JSON.
  }

  throw new Error(message);
}

function isGithubNotFoundError(error: unknown) {
  return error instanceof Error && error.message.includes("status 404");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function githubRequest<T>(pathname: string, init?: RequestInit) {
  const config = getGithubStorageConfig();

  if (!config) {
    throw new Error("GitHub storage is not configured.");
  }

  const response = await fetch(`https://api.github.com${pathname}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers
    },
    cache: "no-store"
  });

  return parseGithubResponse<T>(response);
}

async function listGithubReviewFiles() {
  const config = getGithubStorageConfig();

  if (!config) {
    return [];
  }

  const entries = await githubRequest<GithubContentEntry[]>(
    `/repos/${config.repo}/contents/${config.path}?ref=${encodeURIComponent(config.branch)}`
  );

  return entries.filter((entry) => entry.type === "file" && entry.name.endsWith(".mdx"));
}

async function getGithubReviewFile(filename: string, options: GithubReadOptions = {}) {
  const config = getGithubStorageConfig();

  if (!config) {
    return null;
  }

  try {
    return await githubRequest<GithubContentEntry>(
      `/repos/${config.repo}/contents/${config.path}/${filename}?ref=${encodeURIComponent(config.branch)}`
    );
  } catch (error) {
    if (options.suppressNotFound && isGithubNotFoundError(error)) {
      return null;
    }

    throw error;
  }
}

async function waitForGithubReviewFile(filename: string, attempts = 6, delayMs = 400) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const file = await getGithubReviewFile(filename, { suppressNotFound: true });

    if (file?.content && file.encoding === "base64") {
      return file;
    }

    if (attempt < attempts - 1) {
      await sleep(delayMs);
    }
  }

  throw new Error(`The post was saved but is not readable from GitHub yet: ${filename}`);
}

async function writeGithubReviewFile(filename: string, source: string) {
  const config = getGithubStorageConfig();

  if (!config) {
    throw new Error("GitHub storage is not configured.");
  }

  const existingFile = await getGithubReviewFile(filename, { suppressNotFound: true });
  const body = {
    message: `Add or update review ${filename}`,
    content: Buffer.from(source, "utf8").toString("base64"),
    branch: config.branch,
    sha: existingFile?.sha
  };

  await githubRequest<GithubContentEntry>(`/repos/${config.repo}/contents/${config.path}/${filename}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  await waitForGithubReviewFile(filename);
}

async function deleteGithubReviewFile(filename: string) {
  const config = getGithubStorageConfig();

  if (!config) {
    throw new Error("GitHub storage is not configured.");
  }

  const existingFile = await getGithubReviewFile(filename, { suppressNotFound: true });

  if (!existingFile) {
    const error = new Error(`Review file not found: ${filename}`) as NodeJS.ErrnoException;
    error.code = "ENOENT";
    throw error;
  }

  await githubRequest<GithubContentEntry>(`/repos/${config.repo}/contents/${config.path}/${filename}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Delete review ${filename}`,
      sha: existingFile.sha,
      branch: config.branch
    })
  });
}

function toStorageErrorMessage(action: "write" | "delete", storagePath: string) {
  const configuredDirectory = process.env.REVIEW_STORAGE_DIR?.trim();
  const helpText = configuredDirectory
    ? "Check that REVIEW_STORAGE_DIR points to a writable folder."
    : "Set REVIEW_STORAGE_DIR to a writable persistent folder if you need posts to survive restarts.";

  return `Unable to ${action} post because the server storage is read-only. ${helpText} Current path: ${storagePath}`;
}

function normalizeStorageError(error: unknown, action: "write" | "delete", storagePath: string) {
  const code = error instanceof Error && "code" in error ? (error as NodeJS.ErrnoException).code : undefined;

  if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
    return new Error(toStorageErrorMessage(action, storagePath));
  }

  return error;
}

async function ensureReviewsDirectory() {
  if (isGithubStorageEnabled()) {
    return;
  }

  await mkdir(getRuntimeReviewsDirectory(), { recursive: true });
}

async function readFileIfExists(filePath: string) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error ? (error as NodeJS.ErrnoException).code : undefined;

    if (code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function listMdxFiles(directory: string) {
  try {
    const filenames = await readdir(directory);
    return filenames.filter((filename) => filename.endsWith(".mdx"));
  } catch (error) {
    const code = error instanceof Error && "code" in error ? (error as NodeJS.ErrnoException).code : undefined;

    if (code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function getAllReviewFilenames() {
  if (isGithubStorageEnabled()) {
    const entries = await listGithubReviewFiles();
    return entries.map((entry) => entry.name);
  }

  const directoryLists = await Promise.all(getReadableDirectories().map(listMdxFiles));
  const uniqueFilenames = new Set<string>();

  for (const filenames of directoryLists) {
    for (const filename of filenames) {
      uniqueFilenames.add(filename);
    }
  }

  return Array.from(uniqueFilenames);
}

async function readReviewFromFile(filename: string) {
  let source: string | null = null;

  if (isGithubStorageEnabled()) {
    const file = await getGithubReviewFile(filename);

    if (!file?.content || file.encoding !== "base64") {
      const error = new Error(`Review file not found: ${filename}`) as NodeJS.ErrnoException;
      error.code = "ENOENT";
      throw error;
    }

    source = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8");
  } else {
    for (const directory of getReadableDirectories()) {
      source = await readFileIfExists(path.join(directory, filename));

      if (source !== null) {
        break;
      }
    }
  }

  if (source === null) {
    const error = new Error(`Review file not found: ${filename}`) as NodeJS.ErrnoException;
    error.code = "ENOENT";
    throw error;
  }

  const { data, content } = matter(source);
  const slug = filename.replace(/\.mdx$/, "");

  return toToolReview(slug, data as ReviewFrontmatter, content.trim());
}

async function readReviewMetaFromFile(filename: string) {
  const review = await readReviewFromFile(filename);
  return toToolReviewMeta(review);
}

function invalidateReviewCache(slug?: string) {
  reviewMetaCache = null;

  if (slug) {
    reviewContentCache.delete(slug);
    return;
  }

  reviewContentCache.clear();
}

export async function getAllReviews() {
  await ensureReviewsDirectory();
  const filenames = await getAllReviewFilenames();
  const reviews = await Promise.all(filenames.map(readReviewFromFile));

  return reviews.sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

export async function getAllReviewMeta(): Promise<ToolReviewMeta[]> {
  if (isGithubStorageEnabled()) {
    await ensureReviewsDirectory();
    const filenames = await getAllReviewFilenames();
    const reviews = await Promise.all(filenames.map(readReviewMetaFromFile));

    return reviews.sort((left, right) => {
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
  }

  if (!reviewMetaCache) {
    reviewMetaCache = (async () => {
      await ensureReviewsDirectory();
      const filenames = await getAllReviewFilenames();
      const reviews = await Promise.all(filenames.map(readReviewMetaFromFile));

      return reviews.sort((left, right) => {
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      });
    })();
  }

  return reviewMetaCache;
}

export async function getReviewBySlug(slug: string) {
  const normalizedSlug = slugify(slug);

  if (!normalizedSlug) {
    return undefined;
  }

  if (isGithubStorageEnabled()) {
    try {
      return await readReviewFromFile(`${normalizedSlug}.mdx`);
    } catch (error) {
      const isMissingFile =
        error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT";

      if (isMissingFile) {
        return undefined;
      }

      throw error;
    }
  }

  const cachedReview = reviewContentCache.get(normalizedSlug);

  if (cachedReview) {
    return cachedReview;
  }

  const reviewPromise = (async () => {
    try {
      return await readReviewFromFile(`${normalizedSlug}.mdx`);
    } catch (error) {
      const isMissingFile =
        error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT";

      if (isMissingFile) {
        return undefined;
      }

      throw error;
    }
  })();

  reviewContentCache.set(normalizedSlug, reviewPromise);

  return reviewPromise;
}

export async function getReviewsByCategory(category: string) {
  const reviews = await getAllReviewMeta();
  return reviews.filter((review) => review.category === category);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function serializeReviewToMdx(review: ToolReview) {
  const data: Record<string, unknown> = {
    title: review.name,
    slug: review.slug,
    updatedAt: review.updatedAt
  };

  if (review.category && review.category !== "general") data.category = review.category;
  if (review.summary) data.summary = review.summary;
  if (review.tagline) data.tagline = review.tagline;
  if (review.website) data.website = review.website;
  if (review.price) data.price = review.price;
  if (review.rating) data.rating = review.rating;
  if (review.bestFor.length) data.bestFor = review.bestFor;
  if (review.pros.length) data.pros = review.pros;
  if (review.cons.length) data.cons = review.cons;
  if (review.features.length) data.features = review.features;
  if (review.verdict) data.verdict = review.verdict;

  return matter.stringify(review.content, data);
}

async function resolveUniqueSlug(baseSlug: string) {
  const reviews = await getAllReviewMeta();
  const taken = new Set(reviews.map((review) => review.slug));

  if (!taken.has(baseSlug)) {
    return baseSlug;
  }

  let index = 2;

  while (taken.has(`${baseSlug}-${index}`)) {
    index += 1;
  }

  return `${baseSlug}-${index}`;
}

export async function createReviewFile(input: CreateReviewInput) {
  const githubStorageConfigError = getGithubStorageConfigError();

  if (githubStorageConfigError) {
    throw new Error(githubStorageConfigError);
  }

  const baseSlug = slugify(input.slug?.trim() || input.name);

  if (!baseSlug) {
    throw new Error("A valid review title is required.");
  }

  const slug = await resolveUniqueSlug(baseSlug);
  const review: ToolReview = {
    ...input,
    slug,
    updatedAt: input.updatedAt || new Date().toISOString().slice(0, 10),
    rating: Number(input.rating),
    content: input.content.trim()
  };
  const source = serializeReviewToMdx(review);
  const fileName = `${slug}.mdx`;

  await ensureReviewsDirectory();

  if (isGithubStorageEnabled()) {
    await writeGithubReviewFile(fileName, source);
    invalidateReviewCache(slug);
    return review;
  }

  const bundledDirectory = getBundledReviewsDirectory();
  const runtimeDirectory = getRuntimeReviewsDirectory();
  const bundledFilePath = path.join(bundledDirectory, fileName);
  const runtimeFilePath = path.join(runtimeDirectory, fileName);

  try {
    await mkdir(bundledDirectory, { recursive: true });
    await writeFile(bundledFilePath, source, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error ? (error as NodeJS.ErrnoException).code : undefined;

    if (code !== "EROFS" && code !== "EACCES" && code !== "EPERM") {
      throw error;
    }

    try {
      await mkdir(runtimeDirectory, { recursive: true });
      await writeFile(runtimeFilePath, source, "utf8");
    } catch (runtimeError) {
      throw normalizeStorageError(runtimeError, "write", runtimeDirectory);
    }
  }

  invalidateReviewCache(slug);

  return review;
}

export async function deleteReviewFile(slug: string) {
  const githubStorageConfigError = getGithubStorageConfigError();

  if (githubStorageConfigError) {
    throw new Error(githubStorageConfigError);
  }

  const normalizedSlug = slugify(slug);

  if (!normalizedSlug) {
    throw new Error("A valid slug is required.");
  }

  const fileName = `${normalizedSlug}.mdx`;

  if (isGithubStorageEnabled()) {
    await deleteGithubReviewFile(fileName);
    invalidateReviewCache(normalizedSlug);
    return normalizedSlug;
  }

  const runtimeFilePath = path.join(getRuntimeReviewsDirectory(), fileName);
  const bundledFilePath = path.join(getBundledReviewsDirectory(), fileName);

  try {
    await unlink(runtimeFilePath);
  } catch (error) {
    const code = error instanceof Error && "code" in error ? (error as NodeJS.ErrnoException).code : undefined;

    if (code === "ENOENT") {
      try {
        await unlink(bundledFilePath);
      } catch (bundledError) {
        throw normalizeStorageError(bundledError, "delete", bundledFilePath);
      }
    } else {
      throw normalizeStorageError(error, "delete", runtimeFilePath);
    }
  }

  invalidateReviewCache(normalizedSlug);

  return normalizedSlug;
}
