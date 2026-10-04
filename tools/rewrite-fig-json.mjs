// 重写 paper-figures.json:补 captionEn/sourceLabel,修正 Voyager=Figure 2,补 MCP Audit
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/data/paper-figures.json');
const prev = JSON.parse(readFileSync(p, 'utf8'));
const meta = {
  '2210.03629': {
    cap: 'Comparison of 4 prompting methods: (a) Standard, (b) CoT, (c) Act-only, (d) ReAct, on HotpotQA and AlfWorld.',
    note: '原论文 Figure 1:四种提示方式在同一任务上的完整轨迹对比——Standard 直答、CoT 只想不做、Act-only 只做不想、ReAct 边想边做。绿色对勾/红色叉号即成败判定。',
    src: 'Yao et al., ReAct, arXiv:2210.03629, Figure 1',
  },
  '2201.11903': {
    cap: 'Chain-of-thought prompting: the model writes out intermediate reasoning steps before answering.',
    note: '原论文 Figure 1:思维链示例——模型先写出中间推理步骤再给出答案。',
    src: 'Wei et al., Chain-of-Thought Prompting, arXiv:2201.11903, Figure 1',
  },
  '2302.04761': {
    cap: 'Toolformer: self-supervised sampling of API calls worth inserting into text.',
    note: '原论文 Figure 1:Toolformer 如何自监督地决定「在哪里插入哪个 API 调用」——工具使用的开山思路。',
    src: 'Schick et al., Toolformer, arXiv:2302.04761, Figure 1',
  },
  '2307.03172': {
    cap: 'U-shaped performance curve as a function of document position.',
    note: '原论文 Figure 1:著名的 U 型曲线——关键信息放开头或结尾效果最好,埋在上下文正中间性能跌到谷底。CH.04「关键内容放头尾」的直接证据。',
    src: 'Liu et al., Lost in the Middle, arXiv:2307.03172, Figure 1',
  },
  '2310.08560': {
    cap: 'MemGPT processing a conversation with memory pressure: working_context.append(...) calls.',
    note: '原论文 Figure 1:出现记忆压力(System Alert)时,MemGPT 自主调用 working_context.append 把关键事实写入长期记忆——「LLM 管理自己的内存」的最直观演示。',
    src: 'Packer et al., MemGPT, arXiv:2310.08560, Figure 1',
  },
  '2304.03442': {
    cap: 'Generative Agents: interactive simulacra of human behavior in a small town.',
    note: '原论文:Generative Agents 小镇场景——25 个 agent 的记忆/反思/规划驱动拟真社会行为。',
    src: 'Park et al., Generative Agents, arXiv:2304.03442',
  },
  '2405.15793': {
    cap: 'SWE-agent is an LM interacting with a computer through an agent-computer interface (ACI).',
    note: '原论文 Figure 1:SWE-agent 总览——模型通过为它专门设计的 ACI(文件查看器、编辑器、终端)与计算机交互。',
    src: 'Yang et al., SWE-agent, arXiv:2405.15793, Figure 1',
  },
  '2503.09516': {
    cap: 'Search-R1: training LLMs to reason and leverage search engines with reinforcement learning.',
    note: '原论文 Figure 1:Search-R1 框架——推理与搜索调用交替进行,整段轨迹用 RL 优化。',
    src: 'Jin et al., Search-R1, arXiv:2503.09516, Figure 1',
  },
  '2305.16291': {
    cap: 'Voyager consists of three key components: an automatic curriculum, a skill library, and an iterative prompting mechanism.',
    note: '原论文 Figure 2:Voyager 三件套总览——自动课程、代码即行动的技能库、迭代提示自校验。自进化 agent 的教科书式架构。(资产取自官方仓库高清版)',
    src: 'Wang et al., Voyager, arXiv:2305.16291, Figure 2(官方仓库版)',
  },
  '2504.03767': {
    cap: '(a) Claude refuses an MCE attack hidden as octal. (b) Claude executes a very direct MCE attack.',
    note: '原论文 Figure 1(a):面对藏在八进制编码里的 MCP 恶意工具描述,Claude 识别风险并拒绝执行——MCP 安全审计的经典截图(CH.06 安全三坑的实证)。',
    src: 'MCP Safety Audit, arXiv:2504.03767, Figure 1(a)',
  },
};
const byId = new Map(prev.figures.map((f) => [f.id, f]));
const extras = [];
for (const [id, m] of Object.entries(meta)) {
  const f = byId.get(id);
  if (f) {
    f.captionEn = m.cap;
    f.note = m.note;
    f.sourceLabel = m.src;
  } else if (id === '2504.03767') {
    extras.push({
      id, figN: 1, chapter: 'ch06', ok: true,
      file: '/figures/2504-03767-f1a.png',
      captionEn: m.cap, note: m.note, sourceLabel: m.src,
    });
  }
}
const figures = [...prev.figures.filter((f) => f.id !== '2504.03767'), ...extras];
figures.sort((a, b) => (a.chapter || '').localeCompare(b.chapter || '') || a.id.localeCompare(b.id));
writeFileSync(p, JSON.stringify({ updatedAt: new Date().toISOString(), figures }, null, 2));
console.log('paper-figures.json rewritten:', figures.length, 'figures,', figures.filter((f) => f.ok).length, 'ok');
