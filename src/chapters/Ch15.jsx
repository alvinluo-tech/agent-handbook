import CodeBlock from '../components/CodeBlock.jsx'
import { Chapter } from '../components/Bits.jsx'
import { FigEvalLoop } from '../components/Diag2.jsx'

export default function Ch15() {
  return (
    <Chapter ch={{
      id: 'ch15', num: 'CH.15', icon: '📏', title: '评估:Eval 驱动开发', en: 'EVALS — MEASURE BEFORE YOU SCALE', mins: 16,
      quests: ['能搭建最小 eval 集(任务+判分)', '区分结果评估与轨迹评估', '知道 LLM-as-judge 的校准坑', '理解 pass@k 与基准饱和问题'],
    }}>
      <p>这是全书最「不性感」但<strong>最区分新手与高手</strong>的一章。改了提示词,效果好还是差?你的 agent 换了个模型,该不该上线?没有 eval,一切优化都是玄学。2025 年起,「Eval 驱动开发」成为 agent 团队的标准工作流——先建度量,再做优化。</p>

      <FigEvalLoop />

      <h3>15.1 最小可用 Eval:今晚就能建</h3>
      <CodeBlock name="PROMPTFOO.CONFIG.YAML — 50 行起家的评估" code={`# agent_provider.py 必须真正执行 Agent，并返回约定 JSON：
# {"answer": "...", "calls": [{"name": "refund_order", "args": {...}}]}
# 下例为配置骨架；provider 与 golden set 由项目补齐后再运行 promptfoo eval。
prompts: ["{{user_input}}"]
providers: [file://agent_provider.py]
tests:
  - description: 已授权退款请求走工具，且不承诺不可控时限
    vars: { user_input: "订单 ORD-2026-00042 退款已获授权，请建退款申请" }
    assert:
      - type: is-json
        value:
          type: object
          required: [answer, calls]
          properties:
            answer: { type: string }
            calls: { type: array }
      - type: javascript
        value: JSON.parse(output).calls.some(c => c.name === 'refund_order')
  - description: 闲聊不调用工具
    vars: { user_input: "你好呀" }
    assert:
      - type: javascript
        value: JSON.parse(output).calls.length === 0`} kind="核心片段" />
      <p>本例测完整 Agent 的实际轨迹，不把文本中的 JSON 当成已执行工具。参见<a href="https://www.promptfoo.dev/docs/configuration/expected-outputs/javascript/" target="_blank" rel="noreferrer">JS 断言</a>；使用纯模型 provider 时，只能评其输出或调用意图。核心三要素:<strong>任务集</strong>(从真实流量里挑,不是拍脑袋)、<strong>判分器</strong>(代码断言 / LLM-as-judge / 人工)、<strong>回归习惯</strong>(每次改动跑一遍,像 CI)。先用少量高价值用例覆盖关键失败路径，再按风险、覆盖面和置信区间扩充；题集数量本身不保证能拦住事故。</p>

      <h3>15.2 评什么:结果 vs 轨迹</h3>
      <div className="grid2">
        <div className="card idea">
          <span className="card-tag">结果评估 End-to-End</span>
          <p style={{ margin: 0 }}>只看最终交付:答案对不对?测试过没过?任务完成率多少?——<strong>与业务直接对齐</strong>,但失败时不知道错在哪一步,且样本噪声大。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">轨迹评估 Trajectory</span>
          <p style={{ margin: 0 }}>检查过程:用了不该用的工具?绕了 10 弯才到?有没有违规动作?——<strong>定位问题的 X 光</strong>,还能提前发现「结果对但过程危险」的侥幸通过(这在生产上是定时炸弹)。</p>
        </div>
      </div>

      <h3>15.3 LLM-as-Judge:好用但要校准</h3>
      <p>让强模型当裁判,是规模评估的主力(经典论文 MT-Bench,已收录论文库)。三个校准坑必须知道:</p>
      <ul>
        <li><strong>位置偏好</strong>:裁判偏爱先出现的答案 → 交换顺序各评一次取平均。</li>
        <li><strong>自我偏好</strong>:模型偏爱自家风格 → 用不同家族的模型当裁判,或混入人工抽检。</li>
        <li><strong>打分通胀</strong>:1-10 分制永远给 7-8 → 改用成对比较(A vs B 谁好)+ 清晰量规(rubric)。</li>
      </ul>
      <div className="card warn">
        <span className="card-tag">避坑 · 古德哈特定律:指标被优化就会失真</span>
        「当指标变成目标,它就不再是好指标」。在 agent 上最常见的三种变形:① <strong>judge-gaming</strong>——agent 学会讨好裁判模型(多用裁判偏好的句式/结论),分数涨了、真实质量没涨;② <strong>奖励作弊(reward hacking)</strong>——RL 训练出的 agent 钻评分规则空子(比如改测试而不是改代码),OpenAI 与 Anthropic 的 2025 年模型报告都把它列为需要持续监控的失控行为;③ <strong>基准泄漏</strong>——评测题混进训练数据,分数虚高(CH.12 的「刷榜 ≠ 好用」同一根源)。对策:核心指标用自建、不公开的金标集,定期换题,并用人工抽检校准指标本身的健康度。
      </div>

      <h3>15.4 基准地图:各领域的「高考卷」</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>领域</th><th>基准</th><th>考什么</th></tr></thead>
          <tbody>
            <tr><td><b>代码</b></td><td>SWE-bench Verified / Pro · Terminal-Bench 2.0 / 3.0(版本分开比较) · Aider polyglot</td><td>真实 issue 修复、终端任务多步操作</td></tr>
            <tr><td><b>通用助手</b></td><td>GAIA · AgentBench · HLE</td><td>多步推理+工具的综合任务</td></tr>
            <tr><td><b>Web/GUI</b></td><td>WebArena · OSWorld · Mind2Web · BrowseComp</td><td>网页/桌面操作、深度浏览检索</td></tr>
            <tr><td><b>工具调用</b></td><td>tau-bench(客服模拟)· API-Bank · ToolBench</td><td>带规则的交互式工具使用、可靠性</td></tr>
            <tr><td><b>安全</b></td><td>InjecAgent · various red-team 套件</td><td>抗注入、越狱抵抗</td></tr>
          </tbody>
        </table>
      </div>
      <div className="card warn">
        <span className="card-tag">避坑 · 基准迷信</span>
        ① <strong>刷榜 ≠ 好用</strong>:基准被污染(题目泄进训练数据)、你的场景与题目分布不同,都会让榜单失效 → <strong>自建金标集才是护城河</strong>;② <strong>pass@k 的陷阱</strong>:「尝试 k 次有一次对」在 demo 里好看,生产要的是 pass@1 的稳定性;③ <strong>指标要带方差</strong>:报告重复运行结果、样本数和置信区间；波动取决于任务与设置，别为噪声改架构;④ <strong>模型升级漂移</strong>:切换型号、快照或推理设置,工具调用行为可能<strong>悄悄变化</strong>——没有持续 eval,你甚至不知道坏了。所以 eval 要像 CI 一样常驻,而不是一次性项目。
      </div>
      <div className="card tip">
        <span className="card-tag">实战 · eval 平台选型</span>
        开源三件套:promptfoo(CI 友好)、DeepEval(单元测试风)、RAGAS(RAG 专用);托管平台:Langfuse / Braintrust / LangSmith 提供 eval + tracing 一体(CH.17)。原则同框架选型:先最小化跑起来,再谈平台。
      </div>
    </Chapter>
  )
}
