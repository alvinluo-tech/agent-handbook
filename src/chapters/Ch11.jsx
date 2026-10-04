import { Chapter } from '../components/Bits.jsx'

export default function Ch11() {
  return (
    <Chapter ch={{
      id: 'ch11', num: 'CH.11', icon: '🗺️', title: '规划与推理', en: 'PLANNING & REASONING — COT, TOT, REFLEXION', mins: 15,
      quests: ['能解释 CoT / ToT / Reflexion 的差异', '理解 plan-and-execute 与 ReAct 的取舍', '知道「会反思」带来的收益与成本', '能把规划技术落到 prompt 或框架参数'],
    }}>
      <p>循环给了 Agent 心跳,规划技术决定它每一步的<strong>思考质量</strong>。这条技术线全部来自论文(全部收录本书论文库),但从工程视角看,它们只是三种「把更多计算花在想」的方式。理解思想比记住名字重要。</p>

      <h3>11.1 三种「多想一步」的姿态</h3>
      <div className="grid3">
        <div className="card idea">
          <span className="card-tag">CoT · 走直线想清楚</span>
          <p style={{ margin: 0 }}><strong>Chain-of-Thought(2022)</strong>:通过示例或提示引导中间推理，是历史上重要的方法。已有内部推理能力的模型通常不需要再要求「逐步思考」；优先写清目标、约束和验收条件，并评测提示的收益。内部推理不一定向用户完整暴露。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">ToT · 分叉试探</span>
          <p style={{ margin: 0 }}><strong>Tree-of-Thoughts(2023)</strong>:把思考组织成树,生成多个候选路径,自我评估剪枝,可回溯。适合解谜、规划类有明确好坏的问题。代价:调用次数 ×N。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">Reflexion · 吃一堑长一智</span>
          <p style={{ margin: 0 }}><strong>Reflexion(2023)</strong>:失败后不重试旧路,而是生成一段「教训」存进记忆,下次带着教训再战。Agent 版「错题本」,代码与决策任务收益显著。</p>
        </div>
      </div>
      <p>其他值得认识的:Self-Refine(自我批评改进草稿)、RAP(把规划建成 MDP 用 MCTS 搜)、ReWOO(先一次规划好全部工具调用再执行,省 token)、LATS(把 ToT 和 MCTS 带进代码任务)、<strong>CRITIC</strong>(让模型先用工具检验自己的输出——搜证据、跑测试——再改,比「闭卷自评」可靠得多,已收录<a href="#" onClick={() => window.dispatchEvent(new CustomEvent('adg-go', { detail: 'papers' }))}>论文库</a>)。</p>

      <h3>11.2 工程落地:两种规划-执行架构</h3>
      <div className="grid2">
        <div className="card idea">
          <span className="card-tag">边想边做(ReAct 默认)</span>
          <p style={{ margin: 0 }}>每一步基于当前观察决策，适合需要探索或应对变化的任务；观察仍可能陈旧或错误。缺点:缺全局观，可能走弯路；调用次数与模型预算影响费用。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">先计划后执行(Plan-and-Execute)</span>
          <p style={{ margin: 0 }}>强模型一次出完整计划 → 执行器(便宜模型/工具)逐项完成 → 出错再回炉重规划。<strong>长任务省钱</strong>,计划可给人审。缺点:计划基于假设,世界一变就要重规划(re-plan 时机是设计难点)。</p>
        </div>
      </div>
      <div className="card tip">
        <span className="card-tag">实战 · 规划落地的三个层级</span>
        ① <strong>Prompt 层</strong>:系统提示里要求「先输出编号计划,再逐步执行并打钩」——实现较轻，但仍增加 token 和延迟；是否改善完成率需对照评测(todo 列表模式);② <strong>框架层</strong>:LangGraph 的 plan-execute 模板 / CrewAI 的 hierarchical 流程;③ <strong>模型层</strong>:用推理模型专门做规划节点,普通模型做执行——CH.02 说的混合调度。
      </div>

      <h3>11.3 反思的正确姿势</h3>
      <p>「让模型自我反思」人人会写,效果好坏差在细节:</p>
      <ul>
        <li><strong>反思要有外部信号</strong>:测试失败、工具报错、评估分数——对着客观错误反思才有用;对着空气「我做得不够好吗?」只会得到自我感动。</li>
        <li><strong>教训要结构化且可检索</strong>:「当 X 情况时,不要用 A 方案,因为 B」——写成规则存进程序性记忆(CH.09),下次按条件触发,而不是每轮全文背诵。</li>
        <li><strong>反思次数是成本</strong>:每多一轮反思 = 多一次大模型调用。设上限(常见 1-2 次),并只在失败时触发。</li>
      </ul>

      <div className="card warn">
        <span className="card-tag">避坑 · 过度规划综合症</span>
        小任务硬上 ToT/MCTS 是新手炫技重灾区。判据:<strong>任务的解空间是否有结构性</strong>?数独、路径、组合优化 → 搜索类技术大杀四方;开放聊天、写周报 → CoT 都嫌多。是否增加推理预算应由任务成功率、延迟与成本决定；不能因为内部过程不可见就断言推理无用。
      </div>

      <div className="card gold">
        <span className="card-tag">延伸 · 「The Second Half」</span>
        2025 年 姚顺雨(Shunyu Yao，ReAct / Tree of Thoughts 等研究作者)那篇刷屏的《The Second Half》提出:上半场(方法创新)已近尾声,下半场的核心问题变成「<strong>如何定义与度量任务</strong>、如何让 agent 从真实环境经验中持续学习」。这与 2026 年「harness 工程」「自进化 agent」(CH.19)的火热互为印证——规划技术的下一站,是让 agent 自己找到规划方式。
      </div>
      <div className="card warn">
        <span className="card-tag">对立观点也要读</span>
        Apple 的《The Illusion of Thinking》(收录论文库)用河内塔等实验质疑:推理模型在复杂度超过训练分布后成绩<b>断崖式下跌</b>,「思考越长≠答案越对」。此文一出引发推理链泄露、实验设计等大量商榷。<strong>两派之争本身就是最好的学习材料</strong>:别站队,去读原文和双方回应。
      </div>
    </Chapter>
  )
}
