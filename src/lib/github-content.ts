const GITHUB_API = 'https://api.github.com';
const BLOG_ROOT = 'src/content/blog';

type GithubEntry = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
};

type GithubFile = GithubEntry & {
  type: 'file';
  content?: string;
  encoding?: string;
};

export type BlogPostFile = {
  path: string;
  sha: string;
  content: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  draft: boolean;
  coverImage: string;
  coverImageAlt: string;
};

function getConfig() {
  const token = import.meta.env.GITHUB_TOKEN;
  const repository = import.meta.env.GITHUB_REPOSITORY || 'dyudith/old-blog';
  const branch = import.meta.env.GITHUB_BRANCH || 'main';

  if (!token) {
    throw new Error('Falta configurar GITHUB_TOKEN para el CMS de Posts.');
  }

  return { token, repository, branch };
}

function headers(token: string) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2026-03-10',
  };
}

async function githubRequest<T>(path: string, init: RequestInit = {}) {
  const { token } = getConfig();
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      ...headers(token),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body.slice(0, 500)}`);
  }

  return response.json() as Promise<T>;
}

function encodePath(path: string) {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function assertPostPath(path: string) {
  if (
    !path.startsWith(`${BLOG_ROOT}/`) ||
    !path.endsWith('.mdx') ||
    path.includes('..') ||
    path.includes('\\')
  ) {
    throw new Error('Ruta de post inválida.');
  }
}

async function listEntries(path: string): Promise<GithubEntry[]> {
  const { repository, branch } = getConfig();
  const entries = await githubRequest<GithubEntry[]>(
    `/repos/${repository}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`,
  );

  const files: GithubEntry[] = [];

  for (const entry of entries) {
    if (entry.type === 'file' && entry.name.endsWith('.mdx')) {
      files.push(entry);
    } else if (entry.type === 'dir') {
      files.push(...(await listEntries(entry.path)));
    }
  }

  return files;
}

function decodeGithubContent(content: string, encoding?: string) {
  if (encoding !== 'base64') {
    return content;
  }

  return Buffer.from(content.replace(/\n/g, ''), 'base64').toString('utf8');
}

function scalar(frontmatter: string, key: string) {
  const match = frontmatter.match(new RegExp(`^\\s*${key}:\\s*(.+)\\s*$`, 'm'));
  if (!match) return '';

  const value = match[1].trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function tagsValue(frontmatter: string) {
  const raw = scalar(frontmatter, 'tags');
  if (!raw) return [];

  if (raw.startsWith('[') && raw.endsWith(']')) {
    return raw
      .slice(1, -1)
      .split(',')
      .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  return [raw.replace(/^['"]|['"]$/g, '')];
}

function parsePost(path: string, sha: string, content: string): BlogPostFile {
  const match = content.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---\\r?\\n?([\\s\\S]*)$/);

  if (!match) {
    throw new Error(`El post ${path} no tiene frontmatter válido.`);
  }

  const frontmatter = match[1];
  const body = match[2];

  return {
    path,
    sha,
    content,
    title: scalar(frontmatter, 'title'),
    description: scalar(frontmatter, 'description'),
    date: scalar(frontmatter, 'date'),
    tags: tagsValue(frontmatter),
    draft: scalar(frontmatter, 'draft') === 'true',
    coverImage: scalar(frontmatter, 'coverImage'),
    coverImageAlt: scalar(frontmatter, 'coverImageAlt'),
  };
}

export function postBody(post: BlogPostFile) {
  const match = post.content.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---\\r?\\n?([\\s\\S]*)$/);
  return match?.[2] ?? post.content;
}

export async function listBlogPosts() {
  const entries = await listEntries(BLOG_ROOT);
  const posts = await Promise.all(
    entries.map(async (entry) => getBlogPost(entry.path)),
  );

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPost(path: string) {
  assertPostPath(path);

  const { repository, branch } = getConfig();
  const file = await githubRequest<GithubFile>(
    `/repos/${repository}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`,
  );

  if (!file.content) {
    throw new Error(`GitHub no devolvió contenido para ${path}.`);
  }

  return parsePost(path, file.sha, decodeGithubContent(file.content, file.encoding));
}

export function buildPostContent(input: {
  title: string;
  description: string;
  date: string;
  tags: string[];
  draft: boolean;
  coverImage?: string;
  coverImageAlt?: string;
  body: string;
}) {
  const lines = [
    '---',
    `title: ${JSON.stringify(input.title)}`,
    `description: ${JSON.stringify(input.description)}`,
    `date: ${input.date}`,
    `tags: ${JSON.stringify(input.tags)}`,
    `draft: ${input.draft}`,
  ];

  if (input.coverImage) {
    lines.push(`coverImage: ${JSON.stringify(input.coverImage)}`);
  }

  if (input.coverImageAlt) {
    lines.push(`coverImageAlt: ${JSON.stringify(input.coverImageAlt)}`);
  }

  lines.push('---', '', input.body.trimStart());

  return lines.join('\\n');
}

export async function createBlogPost(path: string, content: string, message: string) {
  assertPostPath(path);

  const { repository, branch } = getConfig();

  return githubRequest<{ commit: { sha: string } }>(
    `/repos/${repository}/contents/${encodePath(path)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        content: Buffer.from(content, 'utf8').toString('base64'),
        branch,
      }),
    },
  );
}

export async function updateBlogPost(
  path: string,
  sha: string,
  content: string,
  message: string,
) {
  assertPostPath(path);

  const { repository, branch } = getConfig();

  return githubRequest<{ commit: { sha: string } }>(
    `/repos/${repository}/contents/${encodePath(path)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        content: Buffer.from(content, 'utf8').toString('base64'),
        sha,
        branch,
      }),
    },
  );
}

export async function deleteBlogPost(path: string, sha: string, message: string) {
  assertPostPath(path);

  const { repository, branch } = getConfig();

  return githubRequest<{ commit: { sha: string } }>(
    `/repos/${repository}/contents/${encodePath(path)}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sha,
        branch,
      }),
    },
  );
}
