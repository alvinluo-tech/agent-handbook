import CodeBlock from '../components/CodeBlock.jsx'
import { Chapter } from '../components/Bits.jsx'

const C = ({ children }) => <code style={{ background: 'var(--paper-3)', padding: '1px 6px', border: '2px solid var(--ink)', fontSize: 13 }}>{children}</code>

export default function Ch02() {
  return (
    <Chapter ch={{
      id: 'ch02', num: 'CH.02', icon: '🧱', title: 'LLM 速成底座', en: 'LLM CRASH COURSE FOR AGENT BUILDERS', mins: 15,
      quests: ['能解释 token / 上下文窗口 / 温度', '知道推理模式与预算的取舍', '能读懂上下文与输出预算参数', '理解「模型能力 = Agent 能力上限」'],
    }}>
      <p>零基础玩家必读,老玩家可以速通。你不需要会训模型,但必须像一个「模型的使用者」一样理解它的脾气——因为 Agent 的每一个部件,都受 LLM 底层特性制约。</p>

      <h3>2.1 Token:模型眼里的世界</h3>
      <p>LLM 不读字,读 <strong>token</strong>(词元)。一个中文字约等于 1-2 个 token,一个英文单词约 1.3 个。计费、限速、上下文长度,全都按 token 算。记住两个现实:</p>
      <ul>
        <li><strong>上下文窗口 = 输入 + 输出的总预算</strong>。标称 200K 的窗口,塞满输入就没地方给输出。</li>
        <li>token 化的边界会造成有趣现象:让 LLM 数「strawberry 里有几个 r」曾长期翻车,因为它看到的不是字母序列而是 token 块。(现代模型表现已有改善，但仍要用具体模型和任务验证。)</li>
      </ul>

      <h3>2.2 采样参数:控制模型的「性格」</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>参数</th><th>作用</th><th>Agent 场景建议</th></tr></thead>
          <tbody>
            <tr><td><C>temperature</C></td><td>随机度,越高越发散</td><td>仅在模型支持时从低温度试起；推理模型可能不接受此参数，温度 0 也不保证确定性</td></tr>
            <tr><td><C>top_p</C></td><td>核采样截断</td><td>一般保持默认,和 temperature 二选一调</td></tr>
            <tr><td><C>max_output_tokens</C> / <C>max_completion_tokens</C></td><td>输出预算，名称取决于 API</td><td>给足余量,防输出被截断成残废 JSON</td></tr>
            <tr><td>停止条件 / 结构化输出</td><td>停止生成 / 支持时按 JSON Schema 约束格式</td><td>工具调用场景强烈建议结构化输出</td></tr>
          </tbody>
        </table>
      </div>

      <h3>2.3 推理模式与预算:按任务分配计算</h3>
      <div className="grid2">
        <div className="card idea">
          <span className="card-tag">低推理预算 / 可关闭思考的模式</span>
          <p style={{ margin: 0 }}>优先控制延迟与 token 消耗，适合<strong>路由、分类、抽取、简单工具调用</strong>。GPT、Claude、Gemini、DeepSeek 等产品家族的模式和控制字段各不相同，不能只凭系列名判断是否推理。</p>
        </div>
        <div className="card gold">
          <span className="card-tag">较高推理预算 / 扩展思考模式</span>
          <p style={{ margin: 0 }}>在内部推理上分配更多计算，适合<strong>难题规划、数学/代码攻坚、失败后的复盘</strong>。支持情况取决于具体模型；成本与速度需在相同任务、输出预算下实测，不能给所有模型套固定倍率。</p>
        </div>
      </div>
      <div className="card tip">
        <span className="card-tag">实战 · 混合调度</span>
        成熟的 Agent 系统常做「模型路由」:默认用便宜模型跑循环;检测到卡壳(连续失败、任务复杂度高、用户标记重要)时,把当前状态升级交给推理模型。用回归评测比较质量、延迟与成本，再确定路由阈值。
      </div>

      <h3>2.4 上下文窗口:Agent 的「工作内存」</h3>
      <p>截至 2026-10，已有模型提供百万 token 级窗口；各型号的输入、输出和长输入计费限制应分别核对,但请永远记住三件事:</p>
      <ol>
        <li><strong>大 ≠ 免费</strong>:长上下文既慢又贵,还可能有「中间丢失」(CH.04 详述)。</li>
        <li><strong>有效长度 &lt; 标称长度</strong>:塞满 1M 不代表模型能用好 1M,检索精度随长度衰减。</li>
        <li><strong>窗口管理是 Agent 工程的核心手艺</strong>:这就是 CH.04「上下文工程」整章要讲的。</li>
      </ol>

      <h3>2.5 你的第一个 API 调用(热身)</h3>
      <CodeBlock name="HELLO_LLM.PY" code={`from openai import OpenAI

client = OpenAI()  # 从 OPENAI_API_KEY 读取；本例使用 OpenAI Responses API

resp = client.responses.create(
    model="gpt-6.1-sol",
    reasoning={"effort": "low"},
    max_output_tokens=2048,
    instructions="你是严谨的助手。",
    input="用一句话解释什么是 Agent。",
)
print(resp.output_text)
print(resp.usage)  # 养成看 token 用量的习惯,成本意识从第一天开始`} kind="核心片段" />
      <p>Chat Completions 常用 <C>system / developer / user / assistant / tool</C> 消息；Responses 使用输入/输出 item 与工具结果，Claude 原生 API 又有自己的内容块。OpenAI 兼容端点通常能复用部分 SDK，但模型名、工具格式、推理参数、结构化输出、缓存和嵌入能力必须逐项核对。原版 GPT-5/mini 已标弃用，不再作为本书当前默认；历史实验中的型号保留。参见<a href="https://developers.openai.com/api/docs/deprecations" target="_blank" rel="noreferrer">弃用列表</a>与<a href="https://developers.openai.com/api/docs/guides/latest-model" target="_blank" rel="noreferrer">当前模型指南</a>。</p>

      <div className="card warn">
        <span className="card-tag">避坑 · 模型能力是天花板</span>
        Agent 圈有句老话:<strong>「垃圾模型 + 神仙框架 = 垃圾 Agent」</strong>。2026 年 LangChain 报告其 Deep Agents 在 Terminal-Bench 2.0 上仅靠改进 harness(脚手架)把分数从 52.8 拉到 66.5——说明框架重要;模型与接口能力同样影响结果；应在同一评测设置下比较，不能从榜单推出唯一决定因素。正确的姿势:<strong>框架负责不拖后腿,模型决定上限,评估负责逼近上限</strong>。
      </div>
    </Chapter>
  )
}
