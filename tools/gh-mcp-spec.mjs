// 抓取正确的 MCP 规范仓库并合并进 projects.json
import { readFile, writeFile } from 'node:fs/promises';

const slug = 'modelcontextprotocol/modelcontextprotocol';
(async () => {
  const res = await fetch(`https://api.github.com/repos/${slug}`, {
    headers: { 'User-Agent': 'agent-dev-guide-handbook', Accept: 'application/vnd.github+json' },
  });
  console.log('status', res.status);
  if (!res.ok) process.exit(1);
  const j = await res.json();
  const path = new URL('../src/data/projects.json', import.meta.url);
  const data = JSON.parse(await readFile(path, 'utf8'));
  if (!data.repos.some((r) => r.slug === slug)) {
    data.repos.push({
      slug, cat: 'mcp', why: 'MCP 协议规范本体',
      stars: j.stargazers_count, forks: j.forks_count, openIssues: j.open_issues_count,
      pushedAt: j.pushed_at, createdAt: j.created_at, description: j.description || '',
      url: j.html_url, archived: !!j.archived,
    });
  }
  data.failed = (data.failed || []).filter((s) => s !== 'modelcontextprotocol/protocol');
  data.repos.sort((a, b) => b.stars - a.stars);
  await writeFile(path, JSON.stringify(data, null, 2));
  console.log(`merged: ⭐${j.stargazers_count} pushed ${j.pushed_at?.slice(0, 10)} total=${data.repos.length}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
