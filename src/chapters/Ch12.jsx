import { Chapter } from '../components/Bits.jsx'
import { FigMultiAgent } from '../components/Diag2.jsx'

export default function Ch12() {
  return (
    <Chapter ch={{
      id: 'ch12', num: 'CH.12', icon: '👥', title: '多智能体系统', en: 'MULTI-AGENT SYSTEMS — WHEN ONE IS NOT ENOUGH', mins: 18,
      quests: ['能画出三种多智能体拓扑', '知道 orchestrator-worker 的适用条件', '理解上下文隔离是 sub-agent 的核心价值', '知道何时「不要」用多智能体'],
    }}>
      <p>单 Agent 有天花板:任务太大(窗口装不下)、太杂(工具太多互相干扰)、太慢(无法并行)。<strong>多智能体(Multi-Agent)</strong>是把「一个全能同事」换成「一支分工明确的团队」。但请先记住本章最重要的一句话:<strong>多智能体是最后一张牌,不是第一张</strong>。</p>

      <FigMultiAgent />

      <h3>12.1 什么时候真的需要多 Agent?</h3>
      <div className="grid2">
        <div className="card tip">
          <span className="card-tag">合理的理由</span>
          <ul style={{ margin: '4px 0 0' }}>
            <li><strong>上下文爆炸</strong>:文档总量超过有效上下文或相关性筛选能力时，单个 agent 可能遗漏信息 → 派 sub-agent 各读一部分,只带回结论(CH.04 的隔离原则)。</li>
            <li><strong>天然并行</strong>:多个互不依赖的子任务可同时跑,可能降低总时延，收益取决于可并行比例、编排开销和限流。</li>
            <li><strong>专业隔离</strong>:不同角色用不同模型/工具/权限(写手 agent 没有支付工具)。</li>
            <li><strong>对抗与校验</strong>:生成者 vs 批评者(evaluator-optimizer)提升质量。</li>
          </ul>
        </div>
        <div className="card warn">
          <span className="card-tag">BAD 理由(频打脸)</span>
          <ul style={{ margin: '4px 0 0' }}>
            <li>「听起来更智能」——成本×N,失败面×N。</li>
            <li>简单任务硬拆角色:写封邮件不需要「策划 + 文案 + 审核」三 agent。</li>
            <li>用「多 agent」掩盖糟糕的工具设计——先把单 agent 的工具做好。</li>
          </ul>
          <p style={{ marginBottom: 0 }}><strong>Anthropic 的经验数字</strong>:2025 年研究系统中，单 Agent 约耗普通聊天 4 倍 token，多 Agent 约耗普通聊天 15 倍；这不是多 Agent 相对单 Agent 的通用成本倍率。是否值得并行，要以本任务质量与费用评测决定。定量结论可读 Google 的《Towards a Science of Scaling Agent Systems》(2025-12 初版为 180 组/4 类基准，2026-04 v3 扩展为 260 组/6 类基准,收录<a href="#" onClick={() => window.dispatchEvent(new CustomEvent('adg-go', { detail: 'papers' }))}>论文库</a>前沿分类)。</p>
        </div>
      </div>

      <h3>12.2 拓扑怎么选</h3>
      <ul className="steps">
        <li><b>Orchestrator-Worker(可并行分解、集中校验的任务)</b>Lead agent 拆解任务 → 并行派发 worker → 汇总。可控、好调试、失败域隔离。Anthropic 多 agent 研究系统、Claude Code 的 sub-agent 都是这个模式。</li>
        <li><b>去中心网络(Mesh)</b>agent 互相 handoff(如 OpenAI Agents SDK 的 handoffs、AutoGen 群聊)。灵活,但控制流难审计,适合对话路由类轻场景。</li>
        <li><b>层级树(Hierarchy)</b>经理→主管→工人,MetaGPT/CrewAI 的「虚拟公司」。适合大型结构化项目(如整套软件开发),同样存在消息传递损耗。</li>
      </ul>

      <h3>12.3 生产经验:四个致命细节</h3>
      <div className="card gold">
        <span className="card-tag">来自 <a href="https://www.anthropic.com/engineering/multi-agent-research-system" target="_blank" rel="noreferrer">Anthropic《How we built our multi-agent research system》</a></span>
        <ol style={{ margin: '4px 0 0' }}>
          <li><strong>任务描述就是接口</strong>:Lead 给 worker 的任务书必须写清目标、产出格式、工具边界——模糊任务书 = 垃圾结果 × 并行数。</li>
          <li><strong>并行数要管</strong>:worker 过多会撞限流、烧穿预算;按任务复杂度动态决定派几个。</li>
          <li><strong>让 Lead 当「评审」</strong>:worker 交回的结果要评估质量,不够就重派,而不是照单全收。</li>
          <li><strong>状态持久化</strong>:多 agent 跑 20 分钟,任何时刻崩溃都要能续跑(checkpoint,CH.08)。</li>
        </ol>
      </div>

      <h3>12.4 通信:它们怎么说话</h3>
      <ul>
        <li><strong>消息传递(主流)</strong>:结构化消息 + 交接摘要。核心原则:<strong>传结论,不传过程</strong>——把 3 万 token 的原始探索压缩成 500 token 的发现汇报。</li>
        <li><strong>共享黑板(blackboard)</strong>:共享工作区(文件/内存),各自读写。适合长任务异步协作,如多个 agent 共改一个代码库。</li>
        <li><strong>协议互通</strong>:跨组织/跨框架的 agent 互调用 A2A 协议(CH.18),本框架内通信框架自己管。</li>
      </ul>

      <h3>12.5 集体智慧与集体翻车</h3>
      <p>多 agent 的愿景是「三个臭皮匠顶个诸葛亮」,现实里也会出现「三个诸葛亮变臭皮匠」:</p>
      <ul>
        <li><strong>辩论(debate)</strong>:让多个 agent 各自作答,再互相批评、数轮后收敛。Du 等 2023 年在事实性与推理题上拿到了提升(已收录<a href="#" onClick={() => window.dispatchEvent(new CustomEvent('adg-go', { detail: 'papers' }))}>论文库</a>);但效果高度依赖拓扑——谁跟谁辩、辩几轮、裁判是谁,不是无脑组局就能涨分。</li>
        <li><strong>别和自洽性(self-consistency)混淆</strong>:同一模型采样多次后投票,便宜有效,但没有独立视角——那是一个人的「全民公投」,不算多 agent。</li>
        <li><strong>集体失效三件套</strong>:群体思维(互相附和,越辩越自信地错)、单一栽培(同模型+同提示=同一批盲区,真正的多样性要落在模型/提示/信息来源上)、级联错误(上游小错被下游放大成事故)。<strong>MAST 失效分类</strong>(已收录论文库)发现相当大比例的多 agent 失败是协作机制独有的——单 agent 时代根本不会发生的错误。</li>
      </ul>

      <div className="card boss">
        <span className="card-tag">BOSS 提示</span>
        面试/评审必考:「你的多 agent 系统如何防级联失败?」参考答案要点:① 每个 worker 有独立超时与预算;② Lead 有重派与降级策略(worker 失败 → 换工具/换提示 → 最后降级为单 agent 串行);③ 全链路 tracing 按「任务树」组织(CH.17);④ 关键产物落盘,进程崩了能复活。
      </div>
    </Chapter>
  )
}
