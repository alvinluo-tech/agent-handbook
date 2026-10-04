// 重试抓取失败的仓库并与现有数据合并
// 用法: node tools/gh-retry.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src', 'data', 'projects.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOne(slug) {
  const res = await fetch(`https://api.github.com/repos/${slug}`, {
    headers: { 'User-Agent': 'agent-dev-guide-handbook', Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  return {
    slug, cat: null, why: '', stars: j.stargazers_count, forks: j.forks_count,
    openIssues: j.open_issues_count, pushedAt: j.pushed_at, createdAt: j.created_at,
    description: j.description || '', url: j.html_url, archived: !!j.archived,
  };
}

// 失败仓库的分类与点评(与 gh-projects.mjs 保持一致)
const META = {
  'modelcontextprotocol/servers': ['mcp', 'MCP 官方参考 servers 集合'],
  'modelcontextprotocol/protocol': ['mcp', 'MCP 协议规范本体'],
  'punkpeye/awesome-mcp-servers': ['mcp', '最大的 MCP server 精选列表'],
  'jlowin/fastmcp': ['mcp', 'MCP 服务端开发标准框架'],
  'a2aproject/A2A': ['mcp', 'Linux 基金会 A2A agent 互操作协议'],
  'ag-ui-protocol/ag-ui': ['mcp', 'agent 与前端 UI 的事件流协议'],
  'microsoft/ai-agents-for-beginners': ['learn', '微软 11 课 agent 入门,中文友好'],
  'microsoft/generative-ai-for-beginners': ['learn', '微软生成式 AI 18 课'],
  'e2b-dev/awesome-ai-agents': ['learn', '高星 agent 项目精选列表'],
  'NirDiamant/GenAI_Agents': ['learn', '按难度分级的 agent 教程合集'],
};

const data = JSON.parse(await readFile(DATA, 'utf8'));
const failed = data.failed || [];
console.log('retrying:', failed.join(', '));
const stillFailed = [];
for (const slug of failed) {
  try {
    const r = await fetchOne(slug);
    const [cat, why] = META[slug] || ['learn', ''];
    r.cat = cat; r.why = why;
    data.repos.push(r);
    console.log(`${slug}: ⭐${r.stars} pushed ${r.pushedAt?.slice(0, 10)}`);
  } catch (e) {
    stillFailed.push(slug);
    console.error(`FAIL ${slug}: ${e.message}`);
  }
  await sleep(400);
}
data.failed = stillFailed;
data.repos.sort((a, b) => b.stars - a.stars);
await writeFile(DATA, JSON.stringify(data, null, 2));
console.log(`DONE. total=${data.repos.length} stillFailed=${stillFailed.length}`);
