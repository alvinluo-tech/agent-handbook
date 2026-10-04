// GitHub 高星活跃项目数据抓取(合并模式:C15 修复)
// 用法: node tools/gh-projects.mjs [--force]
// 行为:
//   1) 以本文件 REPOS 为唯一 manifest(单一事实来源),新增项目先加这里;
//   2) 增量合并:抓取成功 → 更新该条并刷新其 fetchedAt;抓取失败/限流 → 保留
//      旧记录并标 stale:true,绝不删历史成功数据;
//   3) 写 src/data/projects.json 后调用 sync-resource-summary 刷新计数。
import { writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src', 'data');
const TARGET = join(DATA, 'projects.json');

// [owner/repo, 分类键, 一句话理由(中文)] —— manifest 共 69 条
const REPOS = [
  // frameworks 框架与编排
  ['langchain-ai/langchain', 'frameworks', '最流行的 LLM 应用开发库,生态庞大'],
  ['langchain-ai/langgraph', 'frameworks', '基于图的 agent 编排,生产级可控性标杆'],
  ['microsoft/autogen', 'frameworks', '微软多智能体对话框架,学术与工业双料;0.4 版重构为事件驱动'],
  ['crewAIInc/crewAI', 'frameworks', '角色分工式多 agent 团队,上手最快'],
  ['openai/openai-agents-python', 'frameworks', 'OpenAI 官方 Agents SDK,handoffs+guardrails 轻量'],
  ['pydantic/pydantic-ai', 'frameworks', '类型安全的 Pythonic agent 框架'],
  ['huggingface/smolagents', 'frameworks', 'HF 极简 CodeAgent,~1000 行看透 agent 本质'],
  ['run-llama/llama_index', 'frameworks', '数据接入与 RAG 框架,可评估为 agent 数据层'],
  ['stanfordnlp/dspy', 'frameworks', '声明式 prompt 编程与自动优化'],
  ['mastra-ai/mastra', 'frameworks', 'TypeScript 原生 agent 框架'],
  ['agno-agi/agno', 'frameworks', '高性能多模态 agent 框架'],
  ['letta-ai/letta', 'frameworks', 'MemGPT 团队记忆优先的 stateful agent 平台'],
  ['google/adk-python', 'frameworks', 'Google Agent Development Kit'],
  ['vercel/ai', 'frameworks', 'TS 生态 AI SDK,统一模型接口与工具调用'],
  ['deepseek-ai/DeepSeek-Harness', 'frameworks', 'DeepSeek 官方开源 harness,「Everything is a Plugin」:模型/工具/会话/沙箱/存储/界面全插件化,带子 agent 与本地记忆服务——2026 harness 论战的官方入场券'],
  // coding 代码智能体
  ['Aider-AI/aider', 'coding', '终端 AI 结对编程鼻祖级项目,repo-map 巧妙'],
  ['All-Hands-AI/OpenHands', 'coding', '开源 Devin,学术界最常用代码 agent 平台'],
  ['cline/cline', 'coding', 'VSCode 里的自主编码 agent,计划/执行分离'],
  ['continuedev/continue', 'coding', '开源 IDE 助手,可自托管'],
  ['google-gemini/gemini-cli', 'coding', 'Google 官方终端 agent,开源上下文管理实现'],
  ['anthropics/claude-code', 'coding', 'Anthropic 官方终端 agent,subagent/hooks 生态'],
  ['block/goose', 'coding', 'Block 开源的可扩展本地 agent'],
  ['SWE-agent/SWE-agent', 'coding', '普林斯顿 ACI 论文实现,agent-computer interface'],
  ['significant-gravitas/autoGPT', 'coding', '自主 agent 鼻祖,历史里程碑'],
  ['geekan/MetaGPT', 'coding', '软件公司隐喻多 agent,经典必读源码'],
  ['OpenBMB/ChatDev', 'coding', 'ChatDev 虚拟软件公司,可玩性强'],
  ['Pythagora-io/gpt-pilot', 'coding', '从零构建整个项目的 agent 先驱'],
  ['badlogic/pi-mono', 'coding', 'Mario Zechner 的极简主义编码 agent:默认只有 4 个工具,自扩展 harness,兼容 Anthropic Agent Skills 规范——读它会改变你对「工具要多少才够」的看法'],
  ['can1357/oh-my-pi', 'coding', 'Pi 的明星 fork:IDE 直连、hash 锚定编辑、LSP 集成,主打「最省 token 的编码 harness」,2026-08 GitHub Trending'],
  // browser 浏览器与计算机操作
  ['browser-use/browser-use', 'browser', '最火开源浏览器 agent,DOM+视觉混合'],
  ['microsoft/playwright-mcp', 'browser', '微软官方 Playwright MCP server,可访问性树方案'],
  ['browserbase/stagehand', 'browser', 'AI+确定性代码混合的浏览器自动化'],
  ['Skyvern-AI/skyvern', 'browser', '视觉 LLM 驱动的工作流浏览器自动化'],
  ['nanobrowser/nanobrowser', 'browser', 'Chrome 多 agent 浏览器扩展'],
  // memory-rag 记忆与 RAG 基础设施
  ['mem0ai/mem0', 'memory', '最流行的 agent 记忆层,LOCOMO SOTA 级'],
  ['chroma-core/chroma', 'memory', '最易用的开源向量数据库'],
  ['qdrant/qdrant', 'memory', 'Rust 高性能向量数据库'],
  ['milvus-io/milvus', 'memory', '云原生分布式向量库'],
  ['infiniflow/ragflow', 'memory', '深度文档理解的 RAG 引擎'],
  ['HKUDS/LightRAG', 'memory', '港大轻量图 RAG,简单高效'],
  // apps agent 应用与产品
  ['open-webui/open-webui', 'apps', '最流行的自托管 LLM 前端'],
  ['lobehub/lobe-chat', 'apps', '插件生态丰富的开源聊天应用'],
  ['danny-avila/LibreChat', 'apps', '多模型多 agent 聊天平台'],
  ['Mintplex-Labs/anything-llm', 'apps', '全栈本地知识库+agent 桌面应用'],
  ['langgenius/dify', 'apps', '可视化 LLM 应用/workflow 编排平台'],
  ['FlowiseAI/Flowise', 'apps', '拖拽式 agent 流程构建器'],
  ['khoj-ai/khoj', 'apps', '个人 AI 第二大脑'],
  ['openclaw/openclaw', 'apps', '2026 现象级开源个人 agent:本地优先+消息优先(WhatsApp/Telegram/Slack 全接),🦞 龙虾吉祥物,60 天增速破 React 纪录——研究「个人 agent 该长什么样」的第一样本'],
  ['NousResearch/hermes-agent', 'apps', 'Nous Research 出品,「与你共同成长的 agent」:自我改进记忆 + MCP + 30+ 消息平台 + 模型无关,与 OpenClaw 并称 2026 两大开源个人 agent'],
  // obs-eval 可观测性与评估
  ['langfuse/langfuse', 'obs', '开源 LLM 工程平台:tracing/eval/prompt 管理'],
  ['Arize-ai/phoenix', 'obs', 'OpenTelemetry 系 LLM 可观测性'],
  ['promptfoo/promptfoo', 'obs', 'prompt 与 agent 测试评估利器'],
  ['confident-ai/deepeval', 'obs', 'LLM 单元测试框架'],
  ['explodinggradients/ragas', 'obs', 'RAG 评估标准库'],
  ['AgentOps-AI/agentops', 'obs', 'agent 会话回放与监控'],
  // sandbox 沙箱与运行时
  ['e2b-dev/E2B', 'sandbox', 'Firecracker 微 VM 代码沙箱,按隔离、网络与运维需求评估'],
  ['daytonaio/daytona', 'sandbox', '亚秒级启动的 AI 云开发环境'],
  ['microsandbox/microsandbox', 'sandbox', '自托管 microVM 沙箱,libmicrovm 思路'],
  // mcp-ecosystem 协议生态
  ['modelcontextprotocol/servers', 'mcp', 'MCP 官方参考 servers 集合'],
  ['modelcontextprotocol/modelcontextprotocol', 'mcp', 'MCP 协议规范本体'],
  ['punkpeye/awesome-mcp-servers', 'mcp', '最大的 MCP server 精选列表'],
  ['jlowin/fastmcp', 'mcp', 'MCP 服务端开发标准框架'],
  ['a2aproject/A2A', 'mcp', 'Linux 基金会 A2A agent 互操作协议'],
  ['ag-ui-protocol/ag-ui', 'mcp', 'agent 与前端 UI 的事件流协议'],
  // learn 学习资源
  ['microsoft/ai-agents-for-beginners', 'learn', '微软 11 课 agent 入门,中文友好'],
  ['microsoft/generative-ai-for-beginners', 'learn', '微软生成式 AI 18 课'],
  ['e2b-dev/awesome-ai-agents', 'learn', '高星 agent 项目精选列表'],
  ['NirDiamant/GenAI_Agents', 'learn', '按难度分级的 agent 教程合集'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOne(slug) {
  const res = await fetch(`https://api.github.com/repos/${slug}`, {
    headers: { 'User-Agent': 'agent-dev-guide-handbook', Accept: 'application/vnd.github+json' },
  });
  if (res.status === 403 || res.status === 429) throw new Error('rate-limited');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  return {
    stars: j.stargazers_count, forks: j.forks_count, openIssues: j.open_issues_count,
    pushedAt: j.pushed_at, createdAt: j.created_at,
    description: j.description || '', url: j.html_url, archived: !!j.archived,
  };
}

async function main() {
  const force = process.argv.includes('--force');
  let prev = { repos: [] };
  try { prev = JSON.parse(await readFile(TARGET, 'utf8')); } catch { /* 首次运行 */ }
  const prevBySlug = new Map(prev.repos.map((r) => [r.slug, r]));

  const out = [];
  const failed = [];
  let rateLimited = false;
  for (const [slug, cat, why] of REPOS) {
    if (rateLimited && !force) {
      // 限流后:保留旧记录,标记 stale
      const old = prevBySlug.get(slug);
      if (old) out.push({ ...old, cat, why, stale: true });
      else failed.push(slug);
      continue;
    }
    try {
      const j = await fetchOne(slug);
      out.push({ slug, cat, why, ...j, fetchedAt: new Date().toISOString() });
      console.log(`${slug}: ⭐${j.stars} pushed ${j.pushedAt?.slice(0, 10)}`);
    } catch (e) {
      const old = prevBySlug.get(slug);
      if (e.message === 'rate-limited') rateLimited = true;
      if (old) {
        out.push({ ...old, cat, why, stale: true });
        console.error(`KEEP-OLD ${slug}(${e.message})`);
      } else {
        failed.push(slug);
        console.error(`FAIL ${slug}: ${e.message}`);
      }
    }
    await sleep(350);
  }
  out.sort((a, b) => b.stars - a.stars);
  const staleCount = out.filter((r) => r.stale).length;
  await writeFile(TARGET, JSON.stringify({ fetchedAt: new Date().toISOString(), repos: out, failed }, null, 2));
  console.log(`DONE. total=${out.length} fresh=${out.length - staleCount} stale(保留旧数据)=${staleCount} failed(无历史)=${failed.length}`);
  // 同步资源计数(与站点侧栏/首页保持同一来源)
  try {
    spawn(process.execPath, [join(ROOT, 'tools', 'sync-resource-summary.mjs')], { stdio: 'inherit' });
  } catch { console.warn('resource-summary 同步失败,可手动运行 tools/sync-resource-summary.mjs'); }
}

main().catch((e) => { console.error(e); process.exit(1); });
