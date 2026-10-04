import { useLocationHash, parseRoute, navigate, updateFilters } from '../lib/navigation.js'
import { useMemo } from 'react'
import papersData from '../data/papers.json'

const CATS = [
  { key: 'all', cn: '全部' },
  { key: 'foundations', cn: '奠基之作' },
  { key: 'planning', cn: '规划与推理' },
  { key: 'tooluse', cn: '工具使用' },
  { key: 'multiagent', cn: '多智能体' },
  { key: 'memory', cn: '记忆' },
  { key: 'rag', cn: '检索增强' },
  { key: 'code', cn: '代码智能体' },
  { key: 'web', cn: 'Web 与桌面' },
  { key: 'eval', cn: '评估基准' },
  { key: 'safety', cn: '安全' },
  { key: 'frontier', cn: '综述与前沿' },
]

// 精选论文的中文导读(重点必读标注)
const NOTES = {
  '1706.03762': '一切的起点。读懂 Self-Attention,才算真正入门 Transformer。',
  '2005.14165': 'GPT-3 与 in-context learning:不用微调,给例子就会——Agent 的行为学基础。',
  '2210.03629': '⭐ 必读之必读。ReAct 是常见 Agent 循环的研究基础,CH.03 的论文原点。',
  '2201.11903': '思维链:一句「Let\'s think step by step」背后的系统性方法。',
  '2305.10601': '把思考变成树搜索,自我评估+回溯。推理模型的远祖之一。',
  '2303.11366': '失败生成「语言化教训」存记忆再战——Agent 版错题本。',
  '2302.04761': '教会模型自己决定调用哪些 API,工具使用的开山之作。',
  '2305.15334': '「会调 API 的 Gorilla」+ APIBench:工具调用准确率研究的基准源头。',
  '2303.17580': '让 GPT 当「控制器」调度 Hundreds of 模型——task planning 经典。',
  '2402.01030': 'CodeAct:让 agent 写代码当行动,研究在指定模型和任务下比较代码行动与文本/JSON 行动，不能直接推广到所有模型和场景。smolagents 的理论根基。',
  '2304.03442': '斯坦福 AI 小镇:25 个 agent 自主社会行为的里程碑, Generative Agents。',
  '2308.00352': 'MetaGPT:软件公司流水线隐喻(SOP→多agent),多agent 工程化鼻祖。',
  '2308.08155': '微软 AutoGen:对话式多 agent 框架论文,早期多 Agent 框架研究；项目现已进入维护模式。',
  '2310.08560': '⭐ MemGPT:把 LLM 当操作系统、记忆分页管理——现代 agent 记忆架构的源头。',
  '2504.19413': 'Mem0:可扩展生产级记忆层,抽取-合并-检索流水线 + LOCOMO 实验。',
  '2405.14831': 'HippoRAG:借鉴海马体索引理论的知识图谱记忆。',
  '2501.13956': 'Zep:时序知识图谱记忆,处理「事实随时间变化」。',
  '2005.11401': 'RAG 原始论文,开卷考试思想的起点。',
  '2404.16130': '微软 GraphRAG:实体图谱+社区摘要,攻克「全局理解型问题」。',
  '2501.09136': 'Agentic RAG 综述:当检索变成 agent 手里的工具。',
  '2307.03172': 'Lost in the Middle:长上下文中间信息被忽略的系统性证据,上下文工程的实证基础。',
  '2310.06770': 'SWE-bench:让 AI 修真实 GitHub issue,代码 agent 的高考卷。',
  '2405.15793': 'SWE-agent:提出 ACI(agent-computer interface)概念——给模型设计的接口也是门手艺。',
  '2407.16741': 'OpenHands(原 OpenDevin):开源代码 agent 平台,可学习其运行时、工具与评测设计的研究/工程平台。',
  '2408.06292': 'The AI Scientist:全自动「提出想法→实验→写论文」的科研 agent,争议与启发并存。',
  '2307.13854': 'WebArena:自托管真实网站环境的网页 agent 基准。',
  '2404.07972': 'OSWorld:真实操作系统环境跨应用任务基准。',
  '2501.12326': '字节 UI-TARS:原生 GUI agent 模型,「看屏幕直接决策」路线代表。',
  '2311.12983': 'GAIA:面向「人类都嫌简单」的通用助手任务基准,暴露 agent 短板。',
  '2406.12045': 'tau-bench:带业务规则的交互式客服 agent 基准,工具可靠性试金石。',
  '2306.05685': 'MT-Bench:确立 LLM-as-a-Judge 方法论的经典。',
  '2302.12173': '⭐ 间接提示注入的里程碑论文:网页里一行字就能劫持你的 agent。',
  '2312.06674': 'Llama Guard:开源安全护栏分类模型。',
  '2309.07864': '人大《The Rise and Potential of LLM Based Agents》:最常被引用的 agent 综述,体系化必读。',
  '2308.11432': '自主 agent 综述:构建模块(画像/记忆/规划/执行)四件套框架。',
  '2408.08435': 'ADAS:自动设计 agent——「meta agent search」,自进化的起点。',
  '2410.10762': 'AFlow:用 MCTS 自动生成工作流代码。',
  '2505.22954': 'Darwin Gödel Machine:改写自己代码实现自我改进的 agent。',
  '2305.16291': 'Voyager: Minecraft 里自建技能库的终身学习 agent,程序性记忆鼻祖。',
  '2606.20683': '2026 年最该读的综述:提出 harness 六组件解剖,系统化「从 QA 到任务完成」的工程问题。',
  '2512.08296': 'Google Agent 系统缩放研究：2025-12 初版 180 组/4 类基准；2026-04 v3 为 260 组/6 类基准。按所读版本引用，研究架构与任务匹配条件。',
  '2609.00006': '解剖 11 个真实代码 agent 的源码:harness 工程的实证研究,CH.14 的进阶读物。',
  '2506.06941': 'Apple 争议之作:当问题复杂度超过阈值,推理模型反而「想得越多崩得越快」——给「更多推理≠更强」泼的著名冷水,与 CH.11 配套食用。',
  '2501.12948': '⭐ DeepSeek-R1：R1-Zero 展示无需前置 SFT 的 RL 推理涌现，R1 则使用冷启动数据与多阶段训练,推理模型平民化的转折点;CH.02 的论文注脚。',
  '2309.02427': '⭐ CoALA:给语言 Agent 画出「记忆/规划/工具/行动」认知架构分类——CH.09 四类记忆和 CH.11 规划分类的理论源头,必读。',
  '2507.20534': 'Kimi K2(Open Agentic Intelligence):月之暗面的开源万亿级 agentic 模型,工具调用与 agent 任务原生优化的代表。',
  '2305.10250': 'MemoryBank:用艾宾浩斯遗忘曲线做 agent 长期记忆的早期经典,CH.09「遗忘策略」的思想源头之一。',
  '2503.14499': 'METR 任务视野研究:2025 年历史样本中，指定成功率对应的人类任务时长约 7 个月翻倍；不等于 Agent 连续运行时间;长任务可靠性衰减的定量证据,FAQ「稳定性」的科学依据。',
  '2503.13657': 'MAST:14 类多智能体失败分类法(NeurIPS 2025),调试 multi-agent 系统的标准参考——CH.12 的必配。',
  '2503.09516': 'Search-R1:用 RL 训练模型交替推理与调用搜索引擎,agentic RAG 的代表作(CH.10)。',
  '2504.03160': 'DeepResearcher:在真实环境用 RL 扩展深度研究,「Deep Research」能力的开源化路线(CH.19)。',
  '2409.07429': 'Agent Workflow Memory:从历史轨迹归纳可复用工作流存入记忆——程序性记忆的高引代表作(CH.09)。',
  '2402.17753': 'LoCoMo:超长对话记忆基准(ACL 2024,1000+ 引用),Mem0 等记忆系统的标尺(CH.09/15)。',
  '2405.14573': 'AndroidWorld:Google DeepMind 的移动 agent 动态基准,20+ 真实 App(CH.13)。',
  '2601.11868': 'Terminal-Bench:终端环境硬任务基准(Stanford/Laude),harness 工程的主战场(CH.14/15)。',
  '2503.23278': 'MCP 全景与安全威胁的系统化研究(Hou et al.),CH.06 安全三坑的学术版。',
  '2504.03767': 'MCP Safety Audit:实证展示 MCP 场景下的重大安全利用,装 server 前必读(CH.06/16)。',
  '2310.10501': 'NeMo Guardrails(NVIDIA):可编程护栏工具箱,把输入/输出/对话流的安全策略写成 Colang 规则——生产护栏的早期标准实现(CH.16)。',
  '2212.10496': 'HyDE:先让模型生成「假设性答案文档」再做向量检索,零样本即超越普通查询嵌入——CH.10 查询改写的代表技术。',
  '2511.15759': '微软的注入防御实证:分层防御在其实验设置下把攻击成功率 73.2% 压到 8.7%——CH.16「分层防御」的数据源,注意是特定设置结果。',
  '2406.09187': 'GuardAgent(ICML 2025):用一个「守卫 agent」+ 可执行检查逻辑保护目标 agent——护栏从「过滤层」进化为「推理层」(CH.16)。',
  '2303.16434': 'TaskMatrix.AI:把基础模型与百万级 API 连接完成任务的早期蓝图,工具生态编排的思想先驱(CH.05)。',
  '2305.11738': 'CRITIC(ICLR 2024):先用工具(搜索/解释器/测试)检验自己的输出再改——「有外部信号的自我纠错」,比闭卷自评可靠,CH.11 反思节的最佳注脚。',
  '2504.13171': 'Sleep-time Compute(Letta/Berkeley):agent「睡觉」时后台整理记忆、预载答案,离线算力换在线响应——CH.09 记忆工程的新维度。',
  '2305.14325': 'Multiagent Debate(Du et al.):多 agent 各自作答+互相批评能提升事实性与推理——但效果依赖拓扑设计,CH.12「集体智慧与集体翻车」的源头论文。',
  '2506.13131': 'AlphaEvolve(DeepMind):进化式代码 agent,LLM 当变异算子 + 自动评估当选择压,改进了矩阵乘法等经典算法——「agent 造 agent/算法」的工业级实证(CH.19)。',
}

const CLASSIC_YEAR = 2024 // ≤2024 视为经典(相对 2026 而言)

export default function PapersPage() {
  const { params } = parseRoute(useLocationHash())
  const cat = CATS.some((c) => c.key === params.get('cat')) ? params.get('cat') : 'all'
  const q = params.get('q') || ''
  const setCat = (cat) => navigate('papers', { cat, q })
  const setQ = (q) => updateFilters({ q, page: '' })
  const { guides, papers } = papersData

  const counts = useMemo(() => {
    const c = { all: papers.length }
    for (const p of papers) c[p.cat] = (c[p.cat] || 0) + 1
    return c
  }, [papers])

  const shown = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return papers
      .filter((p) => cat === 'all' || p.cat === cat)
      .filter((p) => !kw || p.title.toLowerCase().includes(kw) || p.id.includes(kw) || (NOTES[p.id] || '').toLowerCase().includes(kw))
      .sort((a, b) => a.cat.localeCompare(b.cat) || b.year.localeCompare(a.year))
  }, [cat, q, papers])

  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), Math.max(1, Math.ceil(shown.length / 20)))
  const visible = shown.slice((page - 1) * 20, page * 20)
  return (
    <div className="page">
      <div className="page-head">
        <div className="ch-meta">
          <span className="ch-level">EXTRA · 支线</span>
          <span className="ch-mins">📚 {papers.length} 篇论文 · 全部已下载归类 · 数据 2026-10</span>
        </div>
        <h1 className="ch-title">论文军火库</h1>
        <div className="ch-en">PAPER VAULT — READ THE SOURCE, LUKE</div>
      </div>

      <div className="card gold" style={{ marginTop: 26 }}>
        <span className="card-tag">使用说明</span>
        每一篇论文均提供权威官方摘要页（<b>ABS ↗</b>）与原版 PDF 在线直达（<b>PDF ↗</b>），开卷即读。
        带 ⭐ 的是全书点名的「地基级」必读；绿色导读卡片是提炼的中文一句话导读。
        本地开发者亦可运行 <code>npm run download:papers</code> 一键将全量 88 篇原版 PDF 离线缓存至本地。
      </div>

      <div className="card idea">
        <span className="card-tag">行业权威指南(非 arXiv)</span>
        {guides.map((g) => (
          <div key={g.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', padding: '6px 0' }}>
            <b>{g.title}</b>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              <a href={g.url || `https://arxiv.org/abs/${g.id}`} target="_blank" rel="noreferrer">🔗 官方研报 ↗</a>
            </span>
          </div>
        ))}
        <p style={{ margin: '8px 0 0', fontSize: 13 }}>另有三篇必读博客(站外):Anthropic《Building Effective Agents》《Effective Context Engineering》《How we built our multi-agent research system》(正文各章均已内链)。行业报告推荐 LangChain《State of Agent Engineering》(1300+ 从业者调研)。</p>
      </div>

      <div className="toolbar">
        {CATS.map((c) => (
          <button key={c.key} aria-pressed={cat === c.key} className={`chip ${cat === c.key ? 'on' : ''}`} onClick={() => setCat(c.key)}>
            {c.cn}<span className="cnt">×{counts[c.key] || 0}</span>
          </button>
        ))}
      </div>
      <label htmlFor="paper-search">搜索论文</label>
      <input id="paper-search" type="search"
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="🔍 搜索标题 / arXiv ID / 导读关键词…"
        style={{
          width: '100%', padding: '12px 16px', margin: '6px 0 18px', fontSize: 14,
          border: '3px solid var(--ink)', background: 'var(--paper)', boxShadow: 'var(--px-shadow)',
        }}
      />

      <div className="result-controls"><span role="status">匹配 {shown.length} 篇 · 第 {page}/{Math.max(1, Math.ceil(shown.length / 20))} 页</span><button onClick={() => navigate('papers')}>清空搜索与筛选</button></div>
      {visible.map((p) => (
        <div className="paper-card" key={p.id}>
          <div className="paper-top">
            <span className="paper-year">{p.year}</span>
            <span className="paper-title">{p.title}</span>
            <span className="paper-links">
              <a href={p.absUrl} target="_blank" rel="noreferrer">ABS ↗</a>
              <a className="hot" href={`https://arxiv.org/pdf/${p.id}.pdf`} target="_blank" rel="noreferrer">PDF ↗</a>
            </span>
          </div>
          <div className="paper-body">
            <div style={{ marginBottom: 6 }}>
              {p.authors.slice(0, 4).join(', ')}{p.authors.length > 4 ? ' et al.' : ''} · arXiv:{p.id} · {p.published}
              <span className={`tag ${p.year <= CLASSIC_YEAR ? 'k' : 'a'}`} style={{ marginLeft: 10 }}>{p.year <= CLASSIC_YEAR ? '经典' : '近年'}</span>
            </div>
            {NOTES[p.id] && <div className="paper-note">💡 {NOTES[p.id]}</div>}
            {!NOTES[p.id] && <div style={{ color: 'var(--ink-faint)' }}>{p.abstract.slice(0, 130)}…</div>}
          </div>
        </div>
      ))}
      <nav className="pagination" aria-label="论文分页"><button disabled={page <= 1} onClick={() => navigate('papers', { cat, q, page: page - 1 })}>上一页</button><button disabled={page * 20 >= shown.length} onClick={() => navigate('papers', { cat, q, page: page + 1 })}>下一页</button></nav>
      {shown.length === 0 && <p style={{ color: 'var(--ink-faint)' }}>没有匹配的论文,换个关键词试试。</p>}
    </div>
  )
}
