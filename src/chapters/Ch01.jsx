import { Chapter } from '../components/Bits.jsx'
import { FigWorkflowVsAgent } from '../components/Diag.jsx'
import { FigFormula } from '../components/Diag2.jsx'

export default function Ch01() {
  return (
    <Chapter ch={{
      id: 'ch01', num: 'CH.01', icon: '🤖', title: '什么是 Agent?', en: 'WHAT IS AN AGENT — DEFINITIONS & SPECTRUM', mins: 12,
      quests: ['能说清 Workflow 与 Agent 的区别(控制流由谁决定)', '能画出 Agent 五大组件公式', '知道 2025-26 主流大厂对 Agent 的定义差异', '理解「自主性越高,护栏越多」'],
    }}>
      <p>欢迎来到主线第一章。2023 年大家还在争论「ChatGPT 是不是 AGI」,2026 年的今天,「Agent」已经成了软件行业的通用词——但如果你拉十个工程师来定义它,大概率会得到十一个答案。这一章我们先把这个词钉死。</p>

      <h3>一句话定义</h3>
      <div className="quote">
        <b>Agent(智能体)</b> = 一个以 <b>LLM 为推理核心</b>,能够<b>自主决策调用工具</b>、<b>与环境持续交互</b>,并为达成某个目标而<b>循环工作</b>的系统。
        <span className="who">—— 综合 Anthropic / OpenAI / Google 2025-2026 官方定义的公约数</span>
      </div>
      <p>拆开看,这个定义有四个关键词:<strong>LLM 是大脑</strong>(负责理解、规划、决策),<strong>工具是手脚</strong>(搜索、代码执行、API 调用),<strong>环境是 world</strong>(文件系统、浏览器、数据库、其他 agent),<strong>循环是心跳</strong>(不断「思考→行动→观察」直到目标完成)。</p>

      <FigFormula />

      <h3>Workflow vs Agent:控制流在谁手里?</h3>
      <p>这是全书最重要的一次概念区分,来自 Anthropic 那篇被引用最多的工程文章 <a href="https://www.anthropic.com/engineering/building-effective-agents" target="_blank" rel="noreferrer">《Building Effective Agents》</a>:</p>
      <div className="grid2">
        <div className="card idea">
          <span className="card-tag">Workflow 工作流</span>
          <p style={{ margin: 0 }}>LLM 和工具按照<strong>开发者预先写好的代码路径</strong>被编排。每一步做什么、先后顺序,都是你定的。<br /><br /><span className="tag b">可预测</span> <span className="tag b">低延迟</span> <span className="tag b">便宜</span></p>
        </div>
        <div className="card warn">
          <span className="card-tag">Agent 智能体</span>
          <p style={{ margin: 0 }}>LLM <strong>自己决定过程的走向</strong>:规划步骤、选择工具、判断何时完成。控制权交给了模型。<br /><br /><span className="tag a">灵活</span> <span className="tag a">贵</span> <span className="tag a">需要护栏</span></p>
        </div>
      </div>

      <FigWorkflowVsAgent />

      <div className="card tip">
        <span className="card-tag">洞察 · 最容易犯的错</span>
        新手最常见的错误是「一上来就堆自主 Agent」。优先评估可预测的 Workflow，再把需要自主决策的部分限定在受控范围。选择时同时考虑任务路径、错误成本、可观测性与维护成本。客服退货流程是 Workflow;「帮我调研这个市场并写份报告」路径无法预知,才需要 Agent。
      </div>

      <h3>大厂们怎么定义?(2026 视角)</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>来源</th><th>定义侧重</th><th>一句话版本</th></tr></thead>
          <tbody>
            <tr><td><b>Anthropic</b></td><td>控制流归属</td><td>模型自己主导过程与工具使用的系统(与 workflow 相对)</td></tr>
            <tr><td><b>OpenAI</b></td><td>交付价值</td><td>能独立完成你原本要委托人类做的任务的 AI 助手</td></tr>
            <tr><td><b>Google</b></td><td>推理循环</td><td>用 LLM 做决策、调工具、以循环达成目标的应用</td></tr>
            <tr><td><b>微软</b></td><td>企业编排</td><td>可观测、可治理的多 agent 协作系统(Microsoft Agent Framework / Copilot 生态；AutoGen 用于存量项目)</td></tr>
            <tr><td><b>学界</b></td><td>感知-行动</td><td>感知环境 → 推理规划 → 采取行动 → 影响环境的闭环智能体</td></tr>
          </tbody>
        </table>
      </div>
      <p>别被差异吓到——它们其实是从不同视角描述同一个东西。做工程时你只需要记住:<strong>Agent = LLM + 工具 + 循环 + 记忆 + 护栏</strong>。后面每一章,都是在展开这五个词中的一个。</p>

      <h3>自主性阶梯:你要爬到第几层?</h3>
      <ul className="steps">
        <li><b>L1 · 提问机(Chatbot)</b>纯对话,无工具。0 自主性。适合 FAQ、写作润色。</li>
        <li><b>L2 · 路由器(Router)</b>分类用户意图,转发给固定流程。半自动。</li>
        <li><b>L3 · 工具助手(Tool Assistant)</b>人发指令,AI 单次调 1-2 个工具后交还控制权。Copilot 类产品多在此层。</li>
        <li><b>L4 · 执行者(Executor)</b>给定目标,AI 自己拆步骤、多轮调工具、自检后交付。Claude Code / Devin 类。</li>
        <li><b>L5 · 同事(Mate)</b>长期持有目标与记忆,主动发现任务,多 agent 协作,人在关键节点审批。前沿方向。</li>
      </ul>
      <div className="card boss">
        <span className="card-tag">BOSS 提示</span>
        层级越高,自由度越大,<strong>出错的方式也越花哨</strong>。这套阶梯是本书的教学划分，不是全行业部署统计。长任务与跨系统自主行动需要「人在环上」(human-on-the-loop)监督，并按暴露能力增加护栏、评估与观测投入——后面 18 章会逐一展开。
      </div>

      <h3>为什么是现在?(30 秒历史课)</h3>
      <p>Agent 不是新词——强化学习社区研究了几十年。它爆发是因为四块拼图在 2022-2024 年间凑齐了:① <strong>GPT-3.5/4 让推理能力够用</strong>;② <strong>Function Calling(2023.06)</strong>让工具调用有了标准接口;③ <strong>ReAct 等论文(2022-2023)</strong>给了循环的模式;④ <strong>MCP(2024.11)</strong>把工具生态接上了。回头看,每一块拼图都对应本书的一章。</p>
      <div className="card tip">
        <span className="card-tag">2026 产业现状 · 一句话</span>
        LangChain 的<a href="https://www.langchain.com/state-of-agent-engineering" target="_blank" rel="noreferrer">2025 年末调查</a>(11 月 18 日至 12 月 2 日，1340 份问卷)中，<strong>57.3% 的受访者报告已有 Agent 生产部署</strong>。样本以科技行业和小型组织为主，不能代表全球企业采用率；是否采用仍需按业务收益和风险判断。后面 18 章讨论如何把系统做稳。
      </div>
    </Chapter>
  )
}
