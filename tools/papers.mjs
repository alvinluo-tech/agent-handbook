// 论文批量下载与归类脚本
// 用法: node tools/papers.mjs [--meta-only] [--retry-failed]
// 1) 通过 arXiv API 批量校验 ID 并抓取元数据(标题/作者/年份/摘要)
// 2) 将 PDF 下载到 public/papers/<category>/,命名 <arxiv_id>.pdf
// 3) 生成 src/data/papers.json 供网站渲染;失败清单写入 tools/papers-failures.json
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public', 'papers');
const DATA = join(ROOT, 'src', 'data');

// ---- 论文清单:id → 分类(英文键,网站渲染中文标签) ----
const LIST = [
  // planning 规划与推理
  ['2201.11903', 'planning'], // Chain-of-Thought
  ['2305.10601', 'planning'], // Tree of Thoughts
  ['2303.11366', 'planning'], // Reflexion
  ['2303.17651', 'planning'], // Self-Refine
  ['2305.14992', 'planning'], // RAP Reasoning via Planning
  ['2305.18323', 'planning'], // ReWOO
  ['2310.04406', 'planning'], // LATS Language Agent Tree Search
  ['2305.11738', 'planning'], // CRITIC 工具交互式自我纠错(ICLR 2024)
  ['2506.06941', 'planning'], // The Illusion of Thinking(Apple,推理模型争议)
  ['2501.12948', 'planning'], // DeepSeek-R1(RL 激励推理,开源里程碑)
  // foundations 奠基之作
  ['1706.03762', 'foundations'], // Attention Is All You Need
  ['2005.14165', 'foundations'], // GPT-3
  ['2210.03629', 'foundations'], // ReAct
  ['2307.03172', 'foundations'], // Lost in the Middle
  ['2309.02427', 'foundations'], // CoALA 认知架构(agent 记忆/规划分类框架鼻祖)
  // tool-use 工具使用
  ['2302.04761', 'tooluse'], // Toolformer
  ['2305.15334', 'tooluse'], // Gorilla
  ['2307.16789', 'tooluse'], // ToolLLM
  ['2304.08244', 'tooluse'], // API-Bank
  ['2303.17580', 'tooluse'], // HuggingGPT
  ['2303.16434', 'tooluse'], // TaskMatrix.AI(正确 ID;2303.16462 为夸克物理论文)
  ['2402.01030', 'tooluse'], // Executable Code Actions (CodeAct)
  ['2507.20534', 'tooluse'], // Kimi K2: Open Agentic Intelligence
  // multiagent 多智能体
  ['2304.03442', 'multiagent'], // Generative Agents
  ['2308.00352', 'multiagent'], // MetaGPT
  ['2307.07924', 'multiagent'], // ChatDev
  ['2308.08155', 'multiagent'], // AutoGen
  ['2303.17760', 'multiagent'], // CAMEL
  ['2503.13657', 'multiagent'], // MAST 多智能体失败分类(NeurIPS 2025)
  ['2305.14325', 'multiagent'], // Multiagent Debate 多智能体辩论提升事实性(Du et al.)
  // memory 记忆
  ['2310.08560', 'memory'], // MemGPT
  ['2504.19413', 'memory'], // Mem0
  ['2502.12110', 'memory'], // A-MEM
  ['2405.14831', 'memory'], // HippoRAG
  ['2501.13956', 'memory'], // Zep temporal knowledge graph
  ['2305.10250', 'memory'], // MemoryBank(遗忘曲线长期记忆)
  ['2409.07429', 'memory'], // Agent Workflow Memory(从轨迹归纳可复用工作流)
  ['2402.17753', 'memory'], // LoCoMo 超长对话记忆基准(ACL 2024)
  ['2504.13171', 'memory'], // Sleep-time Compute 休眠时计算(Letta/Berkeley)
  // rag 检索增强
  ['2005.11401', 'rag'], // RAG
  ['2310.11511', 'rag'], // Self-RAG
  ['2401.15884', 'rag'], // Corrective RAG
  ['2401.18059', 'rag'], // RAPTOR
  ['2404.16130', 'rag'], // GraphRAG
  ['2501.09136', 'rag'], // Agentic RAG survey
  ['2212.10496', 'rag'], // HyDE 假设性文档嵌入(CH10 查询改写)
  ['2503.09516', 'rag'], // Search-R1(RL 训练模型交替推理与搜索)
  // code 代码智能体
  ['2310.06770', 'code'], // SWE-bench
  ['2405.15793', 'code'], // SWE-agent
  ['2407.16741', 'code'], // OpenDevin/OpenHands
  ['2407.01489', 'code'], // Agentless
  ['2408.06292', 'code'], // The AI Scientist
  ['2501.04227', 'code'], // Agent Laboratory
  // web-desktop Web 与桌面智能体
  ['2112.09332', 'web'], // WebGPT
  ['2306.06070', 'web'], // Mind2Web
  ['2307.13854', 'web'], // WebArena
  ['2404.07972', 'web'], // OSWorld
  ['2312.08914', 'web'], // CogAgent
  ['2501.12326', 'web'], // UI-TARS
  ['2402.07456', 'web'], // OS-Copilot
  ['2504.12516', 'web'], // BrowseComp
  ['2405.14573', 'web'], // AndroidWorld 移动 agent 动态基准(Google DeepMind)
  // evaluation 评估
  ['2311.12983', 'eval'], // GAIA
  ['2406.12045', 'eval'], // tau-bench
  ['2308.03688', 'eval'], // AgentBench
  ['2306.05685', 'eval'], // MT-Bench LLM-as-judge
  // safety 安全
  ['2302.12173', 'safety'], // Indirect Prompt Injection (Greshake et al.)
  ['2312.06674', 'safety'], // Llama Guard
  ['2403.02691', 'safety'], // InjectAgent
  ['2406.09187', 'safety'], // GuardAgent(ICML 2025;原 2310.03021 为天体物理论文,已剔除)
  ['2503.23278', 'safety'], // MCP Landscape & Security Threats(Hou et al.)
  ['2310.10501', 'safety'], // NeMo Guardrails(正确 ID;CH16 防御工具箱点名)
  ['2511.15759', 'safety'], // Securing AI Agents Against Prompt Injection(微软,分层防御 73.2%->8.7%)
  ['2504.03767', 'safety'], // MCP Safety Audit(实证:重大安全利用)
  // surveys-frontier 综述与前沿
  ['2309.07864', 'frontier'], // Rise and Potential of LLM Based Agents
  ['2308.11432', 'frontier'], // Survey on LLM-based Autonomous Agents
  ['2408.08435', 'frontier'], // ADAS Automated Design of Agentic Systems
  ['2410.10762', 'frontier'], // AFlow
  ['2505.22954', 'frontier'], // Darwin Gödel Machine(待校验)
  ['2305.16291', 'frontier'], // Voyager
  ['2508.07407', 'frontier'], // Self-Evolving AI Agents survey(已校验)
  ['2606.20683', 'frontier'], // Agent System and Harness Design survey(2026)
  ['2512.08296', 'frontier'], // Towards a Science of Scaling Agent Systems(Google)
  ['2609.00006', 'frontier'], // Harness Engineering: Anatomy of Coding Agents(2026)
  ['2504.03160', 'frontier'], // DeepResearcher(RL 深度研究,Deep Research 开源化)
  ['2506.13131', 'frontier'], // AlphaEvolve 进化式代码 agent 算法发现(DeepMind 白皮书)
  ['2503.14499', 'eval'], // METR Measuring AI Ability to Complete Long Tasks(任务视野)
  ['2601.11868', 'eval'], // Terminal-Bench 终端任务基准(Stanford/Laude)
];

// 非 arXiv 的行业权威指南(直接 PDF)
const GUIDES = [
  {
    id: 'openai-building-agents',
    title: 'A Practical Guide to Building Agents (OpenAI)',
    url: 'https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf',
    file: 'openai-practical-guide-to-building-agents.pdf',
  },
  {
    id: 'anthropic-building-agents',
    title: 'Building Effective Agents (Anthropic)',
    url: 'https://resources.anthropic.com/hubfs/Building%20Effective%20AI%20Agents-%20Architecture%20Patterns%20and%20Implementation%20Frameworks.pdf',
    file: 'anthropic-building-effective-agents.pdf',
  },
];

const UA = 'agent-dev-guide-handbook/1.0 (educational use; contact: none)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchMeta(ids) {
  const url = `https://export.arxiv.org/api/query?id_list=${ids.join(',')}&max_results=${ids.length}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`arXiv API ${res.status}`);
  const xml = await res.text();
  const entries = xml.split('<entry>').slice(1).map((e) => e.split('</entry>')[0]);
  const out = new Map();
  for (const e of entries) {
    const idUrl = (e.match(/<id>(.*?)<\/id>/) || [])[1] || '';
    const m = idUrl.match(/abs\/([0-9.]+(?:v\d+)?)/);
    if (!m) continue;
    const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const title = clean(decode(e.match(/<title>([\s\S]*?)<\/title>/)?.[1]));
    const summary = clean(decode(e.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]));
    const published = clean(e.match(/<published>(.*?)<\/published>/)?.[1]);
    const updated = clean(e.match(/<updated>(.*?)<\/updated>/)?.[1]);
    const authors = [...e.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((a) => clean(a[1]));
    out.set(m[1].replace(/v\d+$/, ''), { title, summary, published, updated, authors });
  }
  return out;
}

function decode(s) {
  if (!s) return s;
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function downloadPdf(url, dest, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const head = buf.subarray(0, 5).toString('latin1');
      if (!head.startsWith('%PDF')) throw new Error(`not a PDF (head=${head})`);
      if (buf.length < 20000) throw new Error(`too small: ${buf.length}`);
      await writeFile(dest, buf);
      return buf.length;
    } catch (err) {
      if (i === tries - 1) throw err;
      await sleep(2000 * (i + 1));
    }
  }
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function main() {
  const retryFailed = process.argv.includes('--retry-failed');
  let paperList = LIST;
  if (retryFailed) {
    try {
      const fails = JSON.parse(await readFile(join(ROOT, 'tools', 'papers-failures.json'), 'utf8'));
      paperList = LIST.filter(([id]) => fails.missing.includes(id) || fails.failed.includes(id));
      console.log(`retry mode: ${paperList.length} papers`);
    } catch { console.log('no failures file; downloading all'); }
  }

  const metaOnly = process.argv.includes('--meta-only');
  await mkdir(DATA, { recursive: true });

  // 1) 元数据(分批,每批 30)
  const meta = new Map();
  for (let i = 0; i < paperList.length; i += 30) {
    const batch = paperList.slice(i, i + 30).map(([id]) => id);
    try {
      const m = await fetchMeta(batch);
      for (const [k, v] of m) meta.set(k, v);
      console.log(`meta batch ${i / 30 + 1}: got ${m.size}/${batch.length}`);
    } catch (e) {
      console.error(`meta batch failed: ${e.message}`);
    }
    await sleep(1500);
  }

  const missing = paperList.filter(([id]) => !meta.has(id)).map(([id]) => id);
  console.log('missing ids (bad id or API gap):', JSON.stringify(missing));

  const records = [];
  const failed = [];
  if (!metaOnly) {
    // 2) 下载 PDF,并发 3
    const queue = paperList.filter(([id]) => meta.has(id));
    let done = 0;
    const worker = async () => {
      while (queue.length) {
        const [id, cat] = queue.shift();
        const dir = join(PUB, cat);
        await mkdir(dir, { recursive: true });
        const dest = join(dir, `${id}.pdf`);
        try {
          if (await exists(dest)) {
            done++;
            console.log(`skip existing ${id}`);
            continue;
          }
          const size = await downloadPdf(`https://arxiv.org/pdf/${id}`, dest);
          done++;
          console.log(`[${done}/${paperList.length}] ${id} -> ${cat} (${(size / 1e6).toFixed(1)}MB)`);
        } catch (e) {
          failed.push(id);
          done++;
          console.error(`FAIL ${id}: ${e.message}`);
        }
        await sleep(400);
      }
    };
    await Promise.all(Array.from({ length: 3 }, worker));

    // 3) 行业指南
    const guideDir = join(PUB, 'guides');
    await mkdir(guideDir, { recursive: true });
    const guideRecords = [];
    for (const g of GUIDES) {
      const dest = join(guideDir, g.file);
      try {
        if (!(await exists(dest))) await downloadPdf(g.url, dest);
        guideRecords.push({ id: g.id, title: g.title, pdf: `/papers/guides/${g.file}` });
        console.log(`guide ok: ${g.id}`);
      } catch (e) {
        console.error(`guide FAIL ${g.id}: ${e.message}`);
      }
      await sleep(800);
    }

    // 4) 生成 JSON
    for (const [id, cat] of paperList) {
      const m = meta.get(id);
      if (!m) continue;
      records.push({
        id,
        cat,
        title: m.title,
        authors: m.authors,
        year: (m.published || '').slice(0, 4),
        published: (m.published || '').slice(0, 10),
        abstract: m.summary,
        absUrl: `https://arxiv.org/abs/${id}`,
        pdf: failed.includes(id) ? null : `/papers/${cat}/${id}.pdf`,
      });
    }
    records.sort((a, b) => a.cat.localeCompare(b.cat) || a.year.localeCompare(b.year));
    await writeFile(join(DATA, 'papers.json'), JSON.stringify({ guides: guideRecords, papers: records }, null, 2));
    await writeFile(join(ROOT, 'tools', 'papers-failures.json'), JSON.stringify({ missing, failed }, null, 2));
    console.log(`DONE. records=${records.length} failed=${failed.length} missing=${missing.length}`);
  } else {
    const records = paperList.filter(([id]) => meta.has(id)).map(([id, cat]) => {
      const m = meta.get(id);
      return { id, cat, title: m.title, authors: m.authors, year: m.published?.slice(0, 4), abstract: m.summary, absUrl: `https://arxiv.org/abs/${id}` };
    });
    await writeFile(join(DATA, 'papers-meta-check.json'), JSON.stringify(records, null, 2));
    console.log(JSON.stringify(records.map((r) => `${r.id} ${r.year} ${r.title}`), null, 1));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
