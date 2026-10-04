import { Chapter } from '../components/Bits.jsx'

export default function Ch08() {
  return (
    <Chapter ch={{
      id: 'ch08', num: 'CH.08', icon: '🏭', title: 'Runtime 与框架选型', en: 'AGENT RUNTIMES & FRAMEWORK LANDSCAPE', mins: 18,
      quests: ['能对比主流框架的定位差异', '理解「要不要框架」论战双方论点', '知道生产选型的 4 个判据', '理解 Agent Runtime = 循环+状态+工具+护栏'],
    }}>
      <p>学会了裸写循环(CH.03),你会遇到第二个灵魂拷问:<strong>要不要用框架?用哪个?</strong>这一章先把「Agent Runtime」这个概念立起来,再把 2026 年的主流框架摆上货架,最后给你一套选型判据。</p>

      <h3>8.1 什么是 Agent Runtime?</h3>
      <p>框架吵吵嚷嚷,但它们提供的无非是这五件事的组合——这就是 Runtime 的定义:</p>
      <ul className="steps">
        <li><b>循环引擎</b>CH.03 那个 loop 的工业化:步进、并发、流式、恢复(resume)。</li>
        <li><b>状态与检查点</b>把对话/中间态持久化,支持断点续跑、回放、时间旅行调试;长时 agent 的硬需求是<strong>持久化执行(durable execution)</strong>——每一步落库,进程崩了换台机器接着跑,Temporal / Restate 这类工作流引擎做的就是这件事。</li>
        <li><b>工具与协议层</b>工具注册、schema 校验、MCP 接入、权限闸门。</li>
        <li><b>上下文管理</b>compaction、记忆接入、窗口预算(CH.04)。</li>
        <li><b>观测与护栏</b>tracing、预算熔断、人审节点(CH.15-17)。</li>
      </ul>
      <p>反过来说,<strong>任何能干这五件事的都算 Runtime</strong>——包括你手写的那 30 行循环。所以「要不要框架」不是信仰问题,是「这五件事里,哪些你想自己造」的问题。</p>

      <h3>8.2 框架货架(维护状态核查于 2026-10-03)</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>框架</th><th>语言</th><th>定位 / 一句话点评</th></tr></thead>
          <tbody>
            <tr><td><b>LangGraph</b></td><td>Py/TS</td><td>图编排、检查点与可恢复工作流，适合复杂且需显式控制的流程</td></tr>
            <tr><td><b>OpenAI Agents SDK</b></td><td>Py/JS</td><td>官方轻量:agent/handoff/guardrail 三件套,近乎裸循环+甜糖</td></tr>
            <tr><td><b>Claude Agent SDK</b></td><td>Py/TS</td><td>把 Claude Code 的 harness 开放出来:sub-agent、hooks、记忆、MCP,适合复用 Claude Code 执行能力的代码场景</td></tr>
            <tr><td><b>AutoGen</b></td><td>Py</td><td>微软研究系多 Agent 框架；已进入维护模式，不再新增功能。新项目评估 Microsoft Agent Framework，存量项目按迁移指南处理</td></tr>
            <tr><td><b>Microsoft Agent Framework</b></td><td>Py/.NET</td><td>微软当前建议的新项目方向；工作流、Agent 与生态集成，按语言版本核对功能</td></tr>
            <tr><td><b>CrewAI</b></td><td>Py</td><td>角色化团队与流程编排，适合用角色分工表达的业务任务</td></tr>
            <tr><td><b>PydanticAI</b></td><td>Py</td><td>Python 类型与校验驱动，适合重视结构化合同的系统</td></tr>
            <tr><td><b>smolagents</b></td><td>Py</td><td>HuggingFace 极简 CodeAgent,适合研究代码工具调用与最小循环</td></tr>
            <tr><td><b>Google ADK</b></td><td>Py/TS/Go/Java/Kotlin</td><td>Gemini 生态官方套件,与 Vertex AI 云服务深度集成</td></tr>
            <tr><td><b>Mastra</b></td><td>TS</td><td>TypeScript 原生全功能(workflow/memory/eval),TS 团队可评估的方案</td></tr>
            <tr><td><b>Vercel AI SDK</b></td><td>TS</td><td>前端友好,生成式 UI + 工具调用流式,全栈 Web 场景</td></tr>
            <tr><td><b>Agno</b></td><td>Py</td><td>主打高性能多模态 agent,内置记忆/知识/评估全家桶</td></tr>
            <tr><td><b>DeepSeek Harness(DSH)</b></td><td>TS/Node.js</td><td>DeepSeek 官方开源 harness:「Everything is a Plugin」,模型/工具/沙箱/存储/界面全插件化；公开预览的生产成熟度应另行评估</td></tr>
            <tr><td><b>Letta</b></td><td>Py</td><td>MemGPT 团队的「有状态 agent 服务器」,记忆优先设计(CH.09)</td></tr>
          </tbody>
        </table>
      </div>

      <p>Star 与采集时间见 GitHub 兵器谱；星数不代表生产成熟度。AutoGen 状态与迁移参见<a href="https://github.com/microsoft/autogen" target="_blank" rel="noreferrer">官方说明</a>；ADK 各语言功能参见<a href="https://adk.dev/" target="_blank" rel="noreferrer">官方支持表</a>。</p>

      <h3>8.3 论战:「不要框架」vs「框架万岁」</h3>
      <div className="grid2">
        <div className="card warn">
          <span className="card-tag">反方 · 手搓派</span>
          <p style={{ margin: 0 }}>Anthropic 的建议是代表:<strong>直接对着模型 API 写组合模式</strong>(CH.01 的五种)。理由:抽象漏抽象、调试隔靴搔痒、升级被框架绑架;Agent 领域变化太快,框架常成为「历史包袱」。代表观点文:《You don't need a framework》(2024-2025 多篇爆款)。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">正方 · 工程派</span>
          <p style={{ margin: 0 }}>一旦进入生产:检查点恢复、人审闸门、并发编排、tracing——<strong>这些脏活每家都要重写一遍</strong>。LangGraph 的持久化 + 时间旅行调试、Claude Agent SDK 的 sub-agent 体系,自研成本极高。选型取决于维护成本：<strong>评估持久化、恢复、权限和观测需求，再决定复用框架或自建；始终理解底层循环</strong>。</p>
        </div>
      </div>

      <div className="card tip">
        <span className="card-tag">实战 · 选型四判据</span>
        ① <strong>语言栈</strong>:TS 团队别硬上 Python 框架(Mastra / Vercel AI SDK / LangGraph.js 等着);② <strong>流程形态</strong>:固定流程多 → LangGraph / OpenAI SDK;角色团队 → CrewAI;代码 agent → Claude Agent SDK / OpenHands;③ <strong>托管需求</strong>:要 server 化部署选有持久化与 resume 的(LangGraph Platform、Letta、Agno);④ <strong>可替换性</strong>:锁模型?锁云?五分钟后能换掉它吗?
      </div>

      <div className="card idea">
        <span className="card-tag">国内生态速览(截至 2026-10)</span>
        <ul style={{ margin: '4px 0 0' }}>
          <li><strong>模型速览(2026-10-03)</strong>：DeepSeek 的 V4-Pro 与 9 月发布的 <strong>V4.1-Flash</strong>并存，旧 Flash/Vision Exp 已退休，详见<a href="https://api-docs.deepseek.com/updates/" target="_blank" rel="noreferrer">官方更新</a>；Qwen 已有 <strong>3.8</strong>，权重与托管 API 的模态、思考模式和许可需分开查；Kimi <strong>K3</strong> 官方模型卡列 2.8T MoE、视觉与百万上下文，使用自定义 Kimi K3 License；MiniMax 等厂商也提供模型服务。型号存在不代表全部变体具有同一规格。</li>
          <li><strong>GLM 已到 5.3</strong>：<a href="https://docs.z.ai/guides/llm/glm-5.3" target="_blank" rel="noreferrer">GLM-5.3 旗舰</a>(API ID <code>glm-5.3</code>)为 744B/A40B、文本输入、1M 上下文/128K 输出，始终启用推理(low/high/max，不接受 disabled)，权重采用自定义 GLM-5.3 License；<a href="https://huggingface.co/zai-org/GLM-5.3-Flash" target="_blank" rel="noreferrer">5.3-Flash</a>则是 320B/A18B、原生多模态、MIT 许可。API 模态与开放权重能力应分别核对，不能把整个系列写成统一 MIT 或统一文本模型。</li>
          <li><strong>接入边界</strong>：兼容聊天端点可以复用部分 OpenAI SDK，但切换厂商须适配模型 ID、推理设置、工具、结构化输出、缓存和嵌入端点。Claude 的兼容层会忽略部分格式参数，不能承诺本书全部代码只换 key 即可运行。</li>
          <li><strong>编排与低代码</strong>:阿里百炼、字节扣子(Coze)、Dify(本书兵器谱收录)、LightAgent 等轻量框架;接入前确认所需 MCP 规范与客户端能力。</li>
          <li><strong>选型信号</strong>:成本敏感/数据合规/本地化部署场景,国内模型与自建栈值得评估，但需核对许可、数据驻留、真实质量与运维成本;DeepSeek 官方还开源了 <strong>DeepSeek Harness(DSH，见上表)</strong>。模型比较应使用同一仓库、预算和验收集，不能由榜单直接推断本项目表现。</li>
        </ul>
      </div>

      <div className="card gold">
        <span className="card-tag">2026 新势力 · 开源 harness 与个人 agent 浪潮</span>
        本书初稿完成后,货架又上新了(Star 数见<a href="#" onClick={() => window.dispatchEvent(new CustomEvent('adg-go', { detail: 'projects' }))}>兵器谱</a>):<strong>OpenClaw</strong>(消息优先的个人 agent 项目)、<strong>Hermes Agent</strong>(Nous Research)、<strong>DeepSeek Harness</strong>(官方插件化 harness)、<strong>pi-mono</strong>(极简 4 工具哲学)及其 fork <strong>oh-my-pi</strong>。两个信号:① <strong>harness 从框架的附属品变成了独立赛道</strong>(需要结合具体产品的恢复、权限与评测能力判断);② <strong>个人 agent 的形态是「住进消息软件」而非「再多一个网页」</strong>。选型时把它们纳入对比,尤其是自托管个人助手场景。
      </div>

      <div className="card tip">
        <span className="card-tag">海外 API 型号快照 · 2026-10-03</span>
        <ul style={{ margin: '4px 0 0' }}>
          <li><a href="https://developers.openai.com/api/docs/changelog" target="_blank" rel="noreferrer">OpenAI</a>：GPT-6.1 Sol 于 9 月发布，本书当前示例采用 Responses；lite 使用 GPT-6 Luna。原版 GPT-5/mini 的弃用状态与计划关闭日期须按快照核对。</li>
          <li><a href="https://www.anthropic.com/claude-sonnet-5-5" target="_blank" rel="noreferrer">Claude</a>：Opus 5.5 与 Sonnet 5.5 已有官方发布；接入时按原生 SDK 的思考、工具和缓存配置处理。</li>
          <li><a href="https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash" target="_blank" rel="noreferrer">Gemini</a>：官方目录已有稳定的 3.8 Flash；3.1 Pro 仍需按 preview 状态核对，不能由 Flash 版本推断同号 Pro 已发布。</li>
        </ul>
      </div>

      <div className="card boss">
        <span className="card-tag">BOSS 提示</span>
        面试高频题:「如果让你从零做一个 Agent 平台,你要实现哪些模块?」——标准答案就是 8.1 那五件事 + 沙箱(CH.07)+ 评估(CH.15)。能展开讲每一件的坑,并用作品与评测数据支撑回答。
      </div>
    </Chapter>
  )
}
