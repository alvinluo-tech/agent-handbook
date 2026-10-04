// 补录 2026 新项目(OpenClaw/Hermes/DSH/Pi 系)到 projects.json
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// [slug, 分类, 中文点评]
const NEW_REPOS = [
  ['openclaw/openclaw', 'apps', '2026 现象级开源个人 agent:本地优先+消息优先(WhatsApp/Telegram/Slack 全接),🦞 龙虾吉祥物,60 天增速破 React 纪录——研究「个人 agent 该长什么样」的第一样本'],
  ['NousResearch/hermes-agent', 'apps', 'Nous Research 出品,「与你共同成长的 agent」:自我改进记忆 + MCP + 30+ 消息平台 + 模型无关,与 OpenClaw 并称 2026 两大开源个人 agent'],
  ['deepseek-ai/DeepSeek-Harness', 'frameworks', 'DeepSeek 官方开源 agent harness,「Everything is a Plugin」:模型/工具/会话/沙箱/存储/界面全插件化,带子 agent 与本地记忆服务——2026 harness 论战的官方入场券'],
  ['badlogic/pi-mono', 'coding', 'Mario Zechner 的极简主义编码 agent:默认只有 4 个工具,自扩展 harness,兼容 Anthropic Agent Skills 规范——读它会改变你对「工具要多少才够」的看法'],
  ['can1357/oh-my-pi', 'coding', 'Pi 的明星 fork:IDE 直连、hash 锚定编辑、LSP 集成,主打「最省 token 的编码 harness」,2026-08 GitHub Trending'],
];

const UA = { 'User-Agent': 'agent-dev-guide-handbook', Accept: 'application/vnd.github+json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const path = join(ROOT, 'src/data/projects.json');
  const data = JSON.parse(await readFile(path, 'utf8'));
  for (const [slug, cat, why] of NEW_REPOS) {
    if (data.repos.some((r) => r.slug === slug)) { console.log('skip', slug); continue; }
    const res = await fetch(`https://api.github.com/repos/${slug}`, { headers: UA });
    if (!res.ok) { console.error('FAIL', slug, res.status); continue; }
    const j = await res.json();
    data.repos.push({
      slug, cat, why,
      stars: j.stargazers_count, forks: j.forks_count, openIssues: j.open_issues_count,
      pushedAt: j.pushed_at, createdAt: j.created_at, description: j.description || '',
      url: j.html_url, archived: !!j.archived,
    });
    console.log(`${slug}: ⭐${j.stargazers_count}`);
    await sleep(300);
  }
  data.repos.sort((a, b) => b.stars - a.stars);
  await writeFile(path, JSON.stringify(data, null, 2));
  console.log('total repos:', data.repos.length);
})();
