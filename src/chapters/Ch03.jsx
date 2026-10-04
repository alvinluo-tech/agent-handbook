import CodeBlock from '../components/CodeBlock.jsx'
import { Chapter, LoopDemo } from '../components/Bits.jsx'
import { FigAgentLoop } from '../components/Diag.jsx'

export default function Ch03() {
  return (
    <Chapter ch={{
      id: 'ch03', num: 'CH.03', icon: '🔁', title: 'Agent Loop:心跳与灵魂', en: 'THE AGENT LOOP — PERCEIVE, REASON, ACT, OBSERVE', mins: 18,
      quests: ['能徒手写出最小 Agent Loop 伪代码', '理解 ReAct 循环与终止条件设计', '知道循环失控的典型症状与断路器', '跑一遍本章的循环演示'],
    }}>
      <p>如果说 LLM 是 Agent 的大脑,那 <strong>Agent Loop 就是心跳</strong>——把一次性的问答变成持续行动的,就是这圈循环。所有 Agent 框架,剥掉包装后核心都是它。这一章讲透它,你就看穿了 LangGraph、OpenAI Agents SDK、Claude Agent SDK 的本质。</p>

      <FigAgentLoop />

      <h3>3.1 循环的四拍</h3>
      <ol className="steps">
        <li><b>感知 Perceive</b>把用户目标、环境状态、上一轮观察读进上下文。</li>
        <li><b>推理 Reason</b>LLM 基于当前上下文思考:目标是什么?下一步做什么?需要哪个工具?参数填什么?</li>
        <li><b>行动 Act</b>执行模型给出的动作:调用工具 / 生成代码 / 提问 / 直接作答。</li>
        <li><b>观察 Observe</b>把行动结果写回上下文,回到第 1 拍——直到模型判断「任务完成」或触发终止条件。</li>
      </ol>
      <p>这个「边想边做、把结果喂回去再想」的模式,学术名字叫 <strong>ReAct</strong>(Reasoning + Acting,2022 年论文,已收录本书<a href="https://arxiv.org/abs/2210.03629" target="_blank" rel="noreferrer">论文库</a>)。它的伟大之处在于用最朴素的方式打开了「从世界学习」的通道——模型的每一步都基于最新的事实,而不是凭空幻觉。</p>

      <h3>3.2 最小 Agent Loop(接口无关伪代码)</h3>
      <CodeBlock name="MINIMAL_AGENT_LOOP.PY" code={`import json

TOOLS = [
  {"name": "search_web", "description": "搜索互联网,返回摘要列表",
   "parameters": {"query": "string"}},
  {"name": "run_python", "description": "在沙箱里执行 Python 并返回输出",
   "parameters": {"code": "string"}},
]

def execute(name, args):          # 你的「环境」:真正的工具实现
  ...

def agent_loop(goal: str, max_turns=25):
  messages = [
    {"role": "system", "content": "你是 Agent。逐步使用工具完成目标,"
        "完成后调用 finish(answer=...)。"},
    {"role": "user", "content": goal},
  ]
  for turn in range(max_turns):                    # ← 心跳
    resp = llm.chat(messages, tools=TOOLS)         # 感知 + 推理
    if resp.wants_tool:                            # 行动
      obs = execute(resp.tool_name, resp.args)     # 环境执行
      messages.append({"role": "tool", "content": obs})   # 观察
    else:
      return resp.answer                           # 终止:模型认为完成
  return "达到最大轮数,任务未完成(触发熔断)"       # 终止:熔断`} kind="伪代码" />
      <p>看,没有魔法。<strong>Anthropic 说得直白:一个 Agent = 模型在循环里用工具</strong>。框架做的事情只是把这段循环工业化:加状态管理、并行、恢复、 tracing、人审闸门……(CH.08 再对比)。</p>

      <h3>3.3 亲手玩一次循环</h3>
      <p>点下面的按钮,看一个带「人工确认闸门」的 Agent 完成任务的全过程。注意第 8 步:工具权限被拦后,Agent 没有傻重试,而是转向请求人类授权——这是良好设计。</p>
      <LoopDemo />

      <h3>3.4 终止条件:循环必须有刹车</h3>
      <p>一个生产级 loop 需要三层刹车,缺一不可:</p>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>刹车</th><th>机制</th><th>典型参数</th></tr></thead>
          <tbody>
            <tr><td><b>自然终止</b></td><td>模型显式表示完成(finish 工具 / 无工具调用)</td><td>prompt 里写清「完成即停,禁止空转」</td></tr>
            <tr><td><b>硬熔断</b></td><td>轮数 / token / 花费 / 墙钟时间上限</td><td>如 max_turns=25、单任务 $0.5、10 分钟</td></tr>
            <tr><td><b>智能熔断</b></td><td>检测原地打转(重复动作、重复观察)强制介入</td><td>相同 tool+args 连续 ≥2 次 → 换策略或上报</td></tr>
          </tbody>
        </table>
      </div>
      <div className="card warn">
        <span className="card-tag">避坑 · 循环失控三症状</span>
        ① <strong>搓手打转</strong>:反复搜索同一个词(观察毫无新信息)→ 加「已试过动作」记忆;② <strong>永远准备中</strong>:一直「让我先看看…」不交付 → 在 prompt 要求先输出计划再执行,并限制探索性调用次数;③ <strong>雪崩式膨胀</strong>:每轮上下文涨 10K,十几轮后破窗 → 用 CH.04 的压缩技术。
      </div>
      <div className="card gold">
        <span className="card-tag">长任务衰减 · 一条重要实验规律</span>
        <a href="https://metr.org/time-horizons/" target="_blank" rel="noreferrer">METR 任务视野研究</a>测的是：在指定任务集上，模型达到 <strong>50% 或 80% 成功率</strong>所对应的人类专家任务时长，不能等同于 Agent 连续运行时间。2025 年论文在其历史样本中观察到约 7 个月翻倍；后续结果必须注明模型、评测版本和可靠性阈值，不能把这一趋势当普遍定律。工程上仍应<strong>拆小任务、保存检查点、允许止损和恢复</strong>。
      </div>

      <h3>3.5 循环的变体:不止一种心跳</h3>
      <ul>
        <li><strong>ReAct 式(默认)</strong>:每拍都让模型现场决策。灵活,适合探索型任务。</li>
        <li><strong>Plan-and-Execute</strong>:先一次性生成完整计划,再逐项执行,执行器更便宜。适合结构化任务(CH.11)。</li>
        <li><strong>反思循环(Reflexion)</strong>:失败后生成「教训」存进记忆再战。用失败换准确率(CH.11)。</li>
        <li><strong>事件驱动</strong>:不跑大循环,而是监听事件(webhook、定时器)触发小任务。生产系统常用形态。</li>
      </ul>
      <div className="card idea">
        <span className="card-tag">实战 · 判断一个 Agent 产品的好坏</span>
        打开它的日志问三个问题:① 循环一轮有几步、每步可解释吗?② 失败时停在哪一拍(感知/推理/行动)?③ 有没有熔断?——三问过后,内力深浅一目了然。
      </div>
    </Chapter>
  )
}
