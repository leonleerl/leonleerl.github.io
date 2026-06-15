import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'source', '_posts');
const BASE = 'https://leonli.me/api/post';

function fmtDate(iso) {
  if (!iso) return undefined;
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function yamlEscape(str) {
  // Quote titles containing YAML-sensitive characters
  if (/[:#"'\[\]{}|>&*!?%@`]/.test(str) || /^\s|\s$/.test(str)) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  return str;
}

async function fetchAll() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await fetch(`${BASE}?page=${page}`);
    if (!res.ok) throw new Error(`Failed page ${page}: ${res.status}`);
    const json = await res.json();
    const { data, meta } = json.data;
    totalPages = meta.totalPages;
    all.push(...data);
    console.log(`Fetched page ${page}/${totalPages} (${data.length} posts)`);
    page++;
  } while (page <= totalPages);
  return all;
}

function insertMoreTag(content) {
  const text = (content || '').trim();
  if (!text || text.includes('<!-- more -->')) return text;
  const blocks = text.split(/\n{2,}/);
  // Find the first prose block (skip leading headings) and insert the marker after it.
  let cut = -1;
  let inFence = false;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i].trim();
    if (b.startsWith('```')) inFence = !inFence;
    if (inFence || b.startsWith('#') || b === '') continue;
    cut = i;
    break;
  }
  if (cut === -1) return text;
  const head = blocks.slice(0, cut + 1).join('\n\n');
  const tail = blocks.slice(cut + 1).join('\n\n');
  return tail ? `${head}\n\n<!-- more -->\n\n${tail}` : head;
}

function buildMarkdown(post) {
  const lines = ['---'];
  lines.push(`title: ${yamlEscape(post.title)}`);
  const date = fmtDate(post.createdAt);
  const updated = fmtDate(post.updatedAt);
  if (date) lines.push(`date: ${date}`);
  if (updated) lines.push(`updated: ${updated}`);
  const cats = (post.categories || []).map((c) => c.name);
  if (cats.length) {
    lines.push('categories:');
    // Wrap each category in its own array so they are treated as independent
    // (parallel) categories rather than a single nested hierarchy.
    cats.forEach((c) => lines.push(`  - [${yamlEscape(c)}]`));
  }
  if (post.description) lines.push(`description: ${yamlEscape(post.description)}`);
  lines.push('---');
  lines.push('');
  lines.push(insertMoreTag(post.content));
  lines.push('');
  return lines.join('\n');
}

async function main() {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  const posts = await fetchAll();
  console.log(`\nTotal posts: ${posts.length}\n`);
  for (const post of posts) {
    const filename = `${post.slug}.md`;
    const filepath = path.join(POSTS_DIR, filename);
    fs.writeFileSync(filepath, buildMarkdown(post), 'utf8');
    console.log(`Wrote ${filename}  [${(post.categories || []).map((c) => c.name).join(', ')}]`);
  }
  console.log(`\nDone. ${posts.length} markdown files written to source/_posts/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
