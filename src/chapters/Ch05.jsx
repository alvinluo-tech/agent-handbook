import CodeBlock from '../components/CodeBlock.jsx'
import { Chapter } from '../components/Bits.jsx'
import { FigToolCall } from '../components/Diag.jsx'

export default function Ch05() {
  return (
    <Chapter ch={{
      id: 'ch05', num: 'CH.05', icon: '🔧', title: '工具使用与 Function Calling', en: 'TOOL USE & FUNCTION CALLING', mins: 16,
      quests: ['能写出一份合格的工具 Schema', '理解工具调用完整时序(意图→执行→回填)', '掌握工具描述优化的技巧', '知道并行调用与工具数量上限的权衡'],
    }}>
      <p>没有工具的 LLM 是被关在玻璃房里的天才:什么都知道,什么都摸不着。<strong>Function Calling(2023 年 6 月由 OpenAI 推广)</strong>给了模型一双手——这是 Agent 时代的「第一协议」。本章讲清楚它的机制,以及怎么把工具设计得让模型爱用、少错。</p>

      <FigToolCall />

      <h3>5.1 关键认知:模型不执行,只「许愿」</h3>
      <p>初学者最大的误解是「模型调用了 API」。真相是:<strong>模型只输出一段结构化的「调用意图」(tool call),真正执行者是你的代码(runtime)</strong>。这个分离带来了三个工程抓手:执行前可以做<strong>权限校验</strong>、参数<strong>schema 验证</strong>、结果<strong>裁剪回填</strong>。安全性的一半就在这层 runtime(CH.16)。</p>

      <h3>5.2 一份合格的工具 Schema</h3>
      <CodeBlock name="TOOL_SCHEMA.JSON" code={`{
  "name": "get_order_logistics",
  "description": "根据订单号查询物流状态；用户询问订单到哪了/多久到时使用。退款状态用 get_refund_status。",
  "parameters": {
    "type": "object",
    "properties": {
      "order_id": {
        "type": "string",
        "description": "订单号，例如 ORD-2026-00042；从用户消息提取"
      }
    },
    "required": [
      "order_id"
    ],
    "additionalProperties": false
  }
}`} kind="核心片段" />
      <div className="card tip">
        <span className="card-tag">实战 · 工具描述四要诀</span>
        ① <strong>写给新员工看</strong>:把模型当成第一天入职、聪明但不了解公司的工程师;② <strong>说清何时用、何时不用</strong>(正例+反例);③ <strong>参数写清格式与来源</strong>(「从用户消息提取」);④ <strong>返回值说明结构</strong>,模型才知道怎么读。工具描述就是「面向模型的 API 文档」——它烂,调用就烂。
      </div>

      <h3>5.3 工具设计哲学:少而精,粒度对</h3>
      <ul>
        <li><strong>数量</strong>:工具集应由任务与评测决定；工具过多时可以按场景分组或先检索再注入。Arize 的「UI Code Mode」案例把驱动 UI 的 58 个工具合并成 2 个，报告了可靠性提升，但不能据此给所有系统指定统一数量上限(CH.04)。</li>
        <li><strong>粒度</strong>:别做 <code>delete_user_and_send_email_and_notify</code> 这种巨无霸;也别把一个流程切成 7 个微工具让模型自己拼。经验:<strong>一次调用 = 一个有意义的业务动作</strong>。</li>
        <li><strong>容错</strong>:返回结构化错误(错误码+人话解释+建议动作),模型看到能自我修正;返回裸 stack trace 则大概率原地打转。</li>
        <li><strong>幂等与副作用</strong>:写操作尽量幂等(带 idempotency key),高危操作拆成「预览→确认」两步。</li>
      </ul>

      <h3>5.4 进阶机制速览</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>机制</th><th>是什么</th><th>何时用</th></tr></thead>
          <tbody>
            <tr><td><b>并行工具调用</b></td><td>模型一轮给出多个互不依赖的 tool call,并发执行</td><td>「查 A、B、C 三家价格」可减少等待；实际收益受最慢工具、限流与编排开销影响</td></tr>
            <tr><td><b>强制工具</b></td><td>tool_choice 指定必须调用某工具</td><td>流程固定时提升稳定性(如必须先查身份)</td></tr>
            <tr><td><b>结构化输出</b></td><td>按 JSON Schema 约束模型输出</td><td>抽取、表单、与下游系统对接</td></tr>
            <tr><td><b>代码即工具(CodeAct)</b></td><td>不逐个定义工具,让模型写代码调用 SDK</td><td>复杂组合逻辑(循环/分支),一篇工具顶百篇。见 CodeAct 论文</td></tr>
            <tr><td><b>工具检索</b></td><td>先向量检索出相关工具再注入</td><td>工具数量上百的 MCP 生态场景</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card warn">
        <span className="card-tag">避坑 · 三大经典翻车</span>
        ① <strong>参数幻觉</strong>:模型编造不存在的参数值 → schema 加枚举/格式约束 + 执行前校验;② <strong>工具选择困难</strong>:描述含糊或职责重叠 → 改写描述,必要时合并工具;③ <strong>结果爆炸</strong>:一个搜索返回 50KB 文本直接撑爆窗口 → runtime 层裁剪/分页/摘要(CH.04)。
      </div>

      <h3>5.5 Agent Skills:工具的进阶形态(2025-2026)</h3>
      <p>Anthropic 在 2025 年 10 月推出的 <strong>Agent Skills</strong> 正在成为「组织专业知识」的新标准:一个 Skill = 一个文件夹 + <code>SKILL.md</code>(指令与元数据)+ 附属脚本/资源。它的核心设计是<strong>渐进式披露(progressive disclosure)</strong>:</p>
      <ul className="steps">
        <li><b>第一层</b>启动时只在上下文里放每个 skill 的名称+一句话描述(几十 token)。</li>
        <li><b>第二层</b>模型判断某 skill 与任务相关时,才加载完整 SKILL.md。</li>
        <li><b>第三层</b>skill 里链接的脚本/参考文件,按需再读——甚至可以直接执行。</li>
      </ul>
      <p>这就是 CH.04「just-in-time 检索」思想的产品化:把公司里「怎么发周报、怎么做合规审查、怎么部署服务」写成一堆 SKILL.md,agent 就从「通用助手」变成「带着公司手册上岗的员工」。与 MCP 的分工:<strong>MCP 标准化「连接」,Skills 标准化「知识」</strong>——两者正走向融合(Tools 与 Skills 可以互相引用)。</p>

      <h3>5.6 动手:你的第一个带工具的 Agent</h3>
      <CodeBlock name="FIRST_TOOL_AGENT.PY" code={`import json
from openai import OpenAI

client = OpenAI()  # OPENAI_API_KEY；Responses API
tools = [{
    "type": "function", "name": "get_weather",
    "description": "读取城市天气；本示例只返回演示数据，不能当实时天气。",
    "strict": True,
    "parameters": {"type": "object", "properties": {
        "city": {"type": "string"}}, "required": ["city"],
        "additionalProperties": False},
}]

def get_weather(city: str):
    return {"city": city, "source": "demo", "temperature_c": 26, "weather": "晴"}

items = [{"role": "user", "content": "演示如何查询上海天气，并说明数据来源。"}]
for turn in range(5):
    resp = client.responses.create(
        model="gpt-6.1-sol", input=items, tools=tools,
        reasoning={"effort": "low"}, max_output_tokens=4096, store=False)
    if resp.status != "completed":
        raise RuntimeError(f"响应未完成: {resp.status}")
    # 保留全部 output，包括推理项；不要只回填 assistant 文本。
    items.extend(resp.output)
    calls = [item for item in resp.output if item.type == "function_call"]
    if not calls:
        print(resp.output_text)
        break
    for call in calls:
        if call.name != "get_weather":
            raise ValueError("工具未获授权")
        args = json.loads(call.arguments)
        city = args.get("city")
        if not isinstance(city, str) or not city.strip() or len(city) > 100:
            raise ValueError("city 不合法")
        items.append({"type": "function_call_output", "call_id": call.call_id,
                      "output": json.dumps(get_weather(city), ensure_ascii=False)})
else:
    print("达到轮数上限，停止执行")`} kind="核心片段" />
      <p>这个有轮数上限的示例展示了工具调用闭环；运行需要 API 凭证，业务集成还需权限、超时与评测。接下来两章,我们看工具生态如何标准化(MCP),以及让模型「自己写代码当工具」的前置条件:沙箱。</p>
    </Chapter>
  )
}
