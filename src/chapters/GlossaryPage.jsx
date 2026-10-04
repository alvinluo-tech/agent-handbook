import { Acc } from '../components/Bits.jsx'

const TERMS = [
  ['Agent', '智能体', '以 LLM 为核心、能自主决策使用工具并循环工作以达成目标的系统。'],
  ['Agent Loop', '智能体循环', '感知→推理→行动→观察的心跳循环,Agent 自主性的来源(CH.03)。'],
  ['AGI', '通用人工智能', '能达到人类水平完成任何智力任务的 AI。Agent 是通往 AGI 讨论中最受关注的路径之一。'],
  ['A2A', 'Agent 互操作协议', 'Google 发起，2025-06 进入 Linux 基金会、2026-08 进入 AAIF 治理的 agent 间通信协议:Agent Card 发现 + 任务委托(CH.18)。'],
  ['ACI', 'Agent-计算机接口', '为模型(而非人)设计的工具接口,强调可读反馈与防呆(SWE-agent 提出,CH.14)。'],
  ['Agent Skills', '智能体技能', 'Anthropic 2025.10 推出的知识打包标准:文件夹 + SKILL.md + 渐进式披露,按需加载(CH.05)。'],
  ['Benchmark', '基准', '标准化考卷:SWE-bench、GAIA、tau-bench 等,用于横向比较 agent 能力(CH.15)。'],
  ['Compaction', '上下文压缩', '把接近窗口上限的对话历史总结成摘要后重启上下文,保留关键状态(CH.04)。'],
  ['Context Engineering', '上下文工程', '决定「每一轮窗口里放什么」的系统工程,包含提示词、检索、工具结果、记忆与预算的组织方式(CH.04)。'],
  ['Context Rot', '上下文腐烂', '长或混杂上下文可能降低任务表现；程度随模型、信息位置及任务变化，需要实测(CH.04)。'],
  ['COT', '思维链', 'Chain-of-Thought:历史方法：通过示例或提示引导中间推理；内部推理模型通常无需额外要求逐步思考，收益需按任务评测(CH.11)。'],
  ['Deep Agent', '深度智能体', '2025-26 范式:规划工具 + 子 agent + 文件记忆 + 详尽提示 + 长时间预算的组合(Deep Research 同款配方,CH.19)。'],
  ['Embedding', '嵌入向量', '把文本映射成高维向量,语义相近则距离相近;RAG 与记忆检索的地基(CH.10)。'],
  ['Evals', '评估', '「任务集+判分器+回归习惯」三位一体的质量度量体系,eval 驱动开发(CH.15)。'],
  ['Function Calling', '函数调用', '模型输出结构化的工具调用意图,由运行时执行的机制(CH.05)。'],
  ['Firecracker', '微虚拟机', 'AWS 开源的 microVM,亚秒级启动、内核级隔离,E2B 等沙箱的底座(CH.07)。'],
  ['Guardrails', '护栏', '对输入/输出/动作做安全过滤与约束的组件层(规则、分类模型、白名单)(CH.16)。'],
  ['gVisor', '用户态内核', 'Google 的容器沙箱:用用户态「假内核」拦截系统调用,增加系统调用隔离边界；开销随负载变化(CH.07)。'],
  ['Hallucination', '幻觉', '模型一本正经地编造事实。Agent 时代的主要解法:工具取实据、引用来源、允许说「不知道」。'],
  ['Handoff', '任务交接', '多 agent 间转移控制权的动作(A2A / OpenAI Agents SDK 核心概念)(CH.12/18)。'],
  ['Harness / Scaffolding', '脚手架', '包裹模型的工程外壳:循环、工具、上下文管理。效果必须在相同模型、任务与预算下比较(CH.14)。'],
  ['Human-in-the-loop', '人在环中', '关键决策由人审批的协作模式,高危操作的标配闸门(CH.16)。'],
  ['Human-on-the-loop', '人在环上', '人不逐步审批,但全程可观测、可随时接管;L5 自主 agent 的监督形态(CH.01/16)。'],
  ['KV-Cache', '键值缓存', '推理引擎缓存已算过的注意力中间结果;prompt 前缀稳定则命中,省钱又提速(CH.04)。'],
  ['MCP', '模型上下文协议', 'Anthropic 2024.11 发布的「AI 界 USB-C」:agent ↔ 工具/数据的开放标准(CH.06)。'],
  ['Memory', '记忆', '工作/情景/语义/程序性四类,分别住在窗口、日志、向量库、技能文件里(CH.09)。'],
  ['Multi-Agent', '多智能体', '多个 agent 分工协作的系统;orchestrator-worker 适合可并行分解并集中校验的任务(CH.12)。'],
  ['Prompt Injection', '提示注入', '把恶意指令混进输入或外部内容劫持 agent 行为;OWASP LLM01(CH.16)。'],
  ['RAG', '检索增强生成', '先检索相关知识再生成回答,「开卷考试」架构(CH.10)。'],
  ['Reasoning Model', '推理模型', '可在内部推理分配计算预算的模型；能力、推理模式、价格和延迟须按具体型号及本次配置判断(CH.02)。'],
  ['ReAct', '推理+行动', 'Reasoning+Acting:边想边做的循环范式,现代 agent loop 的原型(CH.03)。'],
  ['Structured Output', '结构化输出', '支持的模型/API 可约束 JSON 格式；提示词要求 JSON 不提供同等保证，格式合法仍需业务与证据校验(CH.05)。'],
  ['Sub-agent', '子智能体', '受主 agent 委托、在隔离上下文中干脏活的下属;上下文工程利器(CH.04/12)。'],
  ['Token', '词元', '模型处理文本的最小单位,计费与窗口长度的计量单位(CH.02)。'],
  ['Tool Poisoning', '工具投毒', '在工具描述/返回值中埋恶意指令的供应链攻击(MCP 时代高发)(CH.06/16)。'],
  ['Trace', '追踪', '一次任务执行的完整事件时间线(每轮 LLM 调用/工具执行/token 花费),可观测性核心(CH.17)。'],
  ['Workflow', '工作流', '控制流由代码预定义的编排方式,与 Agent 相对;可预测但僵硬(CH.01)。'],
]

const FAQS = [
  ['零基础、不会编程,能学这本手册吗?', '能,但要按顺序:CH.01-04 先建立概念，其中 CH.02 含 API 演示、CH.03 含循环伪代码；从 CH.05 开始更系统地讨论工具实现。建议先学一点 Python 基础(变量/循环/函数,按自己的基础安排时间),再回来。本书区分完整示例、核心片段与伪代码；运行前配置依赖、密钥及缺省实现，遇错先检查版本和接口——「用 AI 学 AI」是合法的。'],
  ['需要数学/机器学习基础吗?', '做 Agent 工程,几乎不需要:不训模型、不推公式,数学只在你深入模型层(量化/微调/推理优化)时才需要。类比:绝大多数优秀的后端工程师不会造 CPU。'],
  ['2026 年了,该学哪个框架?', '先学「无框架」:把 CH.03 的 30 行循环写熟。然后按目标选:复杂可恢复工作流 → LangGraph；微软生态新项目 → Microsoft Agent Framework;个人效率工具 → Claude Agent SDK / OpenAI Agents SDK;TS 技术栈 → Mastra。记住:框架是方言,循环是普通话。'],
  ['自建 Agent 还是买产品?', '判据:任务是否「路径可枚举 + 错误可容忍」。是 → 买 SaaS/用 Workflow;否 → 自建。混合策略最常见:买通用底座(模型/沙箱/观测),自建业务编排层。'],
  ['Agent 稳定性为什么这么差?能到 99% 吗?', '分级看待:若假设各步独立且成功率都是 99%，10 步全成功约 90%，100 步约 37%；这只是说明性计算，真实错误相关性与恢复策略会改变结果。METR 的任务视野研究(论文库)还发现:任务越长,成功率衰减越陡。所以工程答案是:① 缩短自主链路(多 agent 分工/检查点重试);② 关键节点人审;③ 检测-恢复机制。任何高可靠性声明都须附任务分布、样本量、模型快照、置信区间和监督条件。METR 视野是指定 50%/80% 成功率对应的人类任务时长，并非 Agent 持续运行时长。'],
  ['多智能体和单智能体+好工具,怎么选?', '默认后者。上多 agent 的门槛:任务可并行、单窗口装不下、或需要权限/模型隔离。Anthropic 2025 年研究系统的多 Agent 约耗普通聊天 15 倍 token，单 Agent 约 4 倍，不能当多/单 Agent 固定倍率——先把单 agent 的工具和上下文调好,往往是更便宜的解。'],
  ['中文材料少,英文不行怎么办?', '本书就是为这个问题准备的(全中文+论文导读)。进阶后硬着头皮读英文论文摘要(abstract)+ 用 AI 逐段精读;MCP/框架文档大多有中文社区翻译。三个月后你会发现读英文文档比等翻译快。'],
  ['需要会 Python 还是 TypeScript?', '都能走通,建议「一主一辅」:生态最厚的是 Python(LangGraph/CrewAI/PydanticAI；AutoGen 已进入维护模式),前端与全栈场景是 TS(Vercel AI SDK/Mastra/LangGraph.js)。本书代码示例以 Python 为主,但概念全部语言无关——会画循环图的人,换语言只是一周的事。'],
  ['Agent 会取代程序员吗?', '短答案:取代「任务」,不取代「责任」。代码 agent 已经能独立完成相当比例的真实 issue(CH.14),但需求定义、架构权衡、上线责任依然在人。更现实的图景是:合理使用 Agent 可能提升交付效率，但增益因任务、团队和复核成本而异，应测质量与周期——本书就是让你成为前者的。'],
  ['怎么跟上面试 / 汇报「我会 Agent」?', '拿作品说话:一个带「评估看板 + trace 截图 + 安全设计说明」的项目,胜过任何证书。面试三大高频:Agent Loop 手写、上下文工程策略、注入防御设计——全在本书 CH.03/04/16。'],
]

export default function GlossaryPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div className="ch-meta">
          <span className="ch-level">EXTRA · 支线</span>
          <span className="ch-mins">🎴 {TERMS.length} 个术语 · {FAQS.length} 个常见问题</span>
        </div>
        <h1 className="ch-title">术语图鉴 & 灵魂拷问</h1>
        <div className="ch-en">GLOSSARY & FAQ — YOUR POCKET CODEX</div>
      </div>

      <div className="card gold" style={{ marginTop: 26 }}>
        <span className="card-tag">图鉴用法</span>
        遇到不认识的词来这查;每个术语后标注了详解章节。结合正文做实现与评测；LV 仅记录本站学习进度，不代表职业认证。
      </div>

      <h2 style={{ marginTop: 34 }}>📖 术语图鉴(按字母序)</h2>
      <dl>
      {TERMS.filter((t) => t[0]).map(([en, cn, desc]) => (
        <div className="glossary" key={en}>
          <dt><span>{en}</span><span className="cn">{cn}</span></dt>
          <dd>{desc}</dd>
        </div>
      ))}

      </dl>
      <h2 style={{ marginTop: 44 }}>🔥 灵魂拷问 FAQ</h2>
      {FAQS.map(([q, a]) => (
        <Acc key={q} q={q}>{a}</Acc>
      ))}
    </div>
  )
}
