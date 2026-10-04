import CodeBlock from '../components/CodeBlock.jsx'
import { Chapter } from '../components/Bits.jsx'
import { FigMemory } from '../components/Diag2.jsx'

export default function Ch09() {
  return (
    <Chapter ch={{
      id: 'ch09', num: 'CH.09', icon: '🧠', title: '记忆系统', en: 'MEMORY — WORKING, EPISODIC, SEMANTIC, PROCEDURAL', mins: 16,
      quests: ['能区分 4 类记忆与存储位置', '理解 MemGPT 的记忆分页思想', '知道 mem0 / Letta / Zep 的取舍', '会设计一条记忆写入/遗忘策略'],
    }}>
      <p>人类的聪明一半靠推理,另一半靠「记得」。Agent 也一样:没有记忆,它每次会话都是失忆症患者;有了记忆,它才能积累偏好、吸取教训、越用越懂你。2025 年起,「Agent 记忆」从论文热词变成了生产组件。</p>

      <FigMemory />

      <h3>9.1 四类记忆:先分类再工程</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>类型</th><th>类比人脑</th><th>存什么</th><th>技术载体</th></tr></thead>
          <tbody>
            <tr><td><b>工作记忆</b></td><td>正在想的</td><td>当前对话、目标、工具结果</td><td>上下文窗口(CH.04)</td></tr>
            <tr><td><b>情景记忆</b></td><td>经历过的事</td><td>历史会话、做过什么、结果如何</td><td>对话日志 + 检索(recall)</td></tr>
            <tr><td><b>语义记忆</b></td><td>知识常识</td><td>用户画像、事实、领域知识</td><td>向量库 / 知识图谱</td></tr>
            <tr><td><b>程序性记忆</b></td><td>肌肉记忆</td><td>技能、工作流、经验教训</td><td>技能库、NOTES/AGENTS.md、workflow 模板</td></tr>
          </tbody>
        </table>
      </div>

      <h3>9.2 MemGPT:把 LLM 当操作系统</h3>
      <p>2023 年的 <a href="https://arxiv.org/abs/2310.08560" target="_blank" rel="noreferrer">MemGPT 论文</a>是记忆领域的奠基之作(已收录<a href="https://arxiv.org/abs/2310.08560" target="_blank" rel="noreferrer">论文库</a>)。它借用了操作系统的<strong>虚拟内存分页</strong>思想:</p>
      <ul>
        <li><strong>主上下文(main context)</strong>= 内存:LLM 看得见的窗口,含「核心记忆」(可编辑的用户/agent 卡片)与「对话队列」。</li>
        <li><strong>外部存储(external storage)</strong>= 磁盘:recall storage(全部对话史)与 archival storage(任意知识)。</li>
        <li><strong>自编辑记忆</strong>:模型通过函数调用自己搬数据——「这信息重要,写进核心记忆」「窗口快满,把这段移到档案」。LLM 管理自己的内存,这就是标题里 "LLM as OS" 的含义。</li>
      </ul>
      <p>MemGPT 项目后来演化成 <strong>Letta</strong>:一个「有状态 agent 服务器」,agent 是持久实体(有记忆、可休眠、可唤醒),而不是一次请求。</p>

      <h3>9.3 三大流派:生产选型看这里</h3>
      <div className="grid3">
        <div className="card idea">
          <span className="card-tag">抽取式 · mem0</span>
          <p style={{ margin: 0 }}>对话流 → LLM 抽取事实 → 去重合并入库 → 下次对话检索注入。以 API 形式叠在任意 agent 旁。2025 年 Mem0 论文在 LoCoMo 上报告：相对当时 OpenAI 记忆基线，LLM-judge 指标提升约 26%；相对全上下文方案，p95 延迟下降约 91%。两项比较基线不同，不代表当前产品的通用收益。适合「让产品记住用户」。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">操作系统式 · Letta</span>
          <p style={{ margin: 0 }}>agent 拥有自己的分层记忆并自主编辑。适合「长期同事型」agent:持续项目、个人助理。学习成本高于 mem0。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">知识图谱式 · Zep / Graphiti</span>
          <p style={{ margin: 0 }}>把记忆组织成<strong>时序知识图谱</strong>:实体、关系、时间有效性(「他的经理 3 月前是 A,之后是 B」)。适合关系复杂、需要时序推理的企业场景。</p>
        </div>
      </div>
      <p>Letta 在 2025 年把 MemGPT 思想落成了两个值得认识的具体机制:<strong>记忆块(memory blocks)</strong>与<strong>休眠时计算(sleep-time compute)</strong>。记忆块把核心记忆拆成具名区块(人格、用户画像、当前任务…),agent 读写的是区块而非整段文本,同一区块还能挂到多个会话共享;休眠时计算则让 agent 在「睡觉」时后台整理记忆——把碎片对话蒸馏成事实、预演接下来可能的问题并把答案提前搬进窗口,类似人脑睡眠时的记忆回放。省下的是「在线整理打断干活」的成本,代价是后台算力;是否值得,取决于会话密度与预算(论文已收录<a href="#" onClick={() => window.dispatchEvent(new CustomEvent('adg-go', { detail: 'papers' }))}>论文库</a>记忆分类)。</p>

      <h3>9.4 记忆的写入与遗忘策略</h3>
      <CodeBlock name="MEMORY_POLICY.PSEUDO" code={`写入(何时记):
  用户显式说「记住…」           → 直接写,最高优先级
  出现稳定事实(偏好/身份/约束)  → 抽取合并,标注来源与时间
  出现教训(任务失败原因)       → 写入程序性记忆,附触发条件
  (反例:临时数字、寒暄、一次性指令 → 不记)

读取(何时想):
  每轮先检索 top-k 相关记忆注入(带来源标签)
  冲突时:新事实 > 旧事实,但保留旧条目供回溯

遗忘(如何忘):
  TTL + 访问频率衰减(长期不用的降权)
  用户有权查看/删除(合规刚需:GDPR/个保法)
  记忆可被「推翻」但不可静默篡改(审计日志)`} kind="核心片段" />

      <div className="card warn">
        <span className="card-tag">避坑 · 记忆三坑</span>
        ① <strong>记忆污染</strong>:错误信息被记下后反复强化 → 写入前做事实校验,允许显式纠错指令覆盖;② <strong>检索噪音</strong>:啥都记导致召回一堆无关记忆 → 记忆也要「结构化+打分」,宁缺毋滥;③ <strong>隐私裸奔</strong>:用户身份证号被记进向量库 → 敏感信息脱敏层 + 存储加密 + 删除接口,从第一天设计。
      </div>
      <div className="card tip">
        <span className="card-tag">实战 · 记忆起步套餐</span>
        别急着上向量库。第一版:一个 <code>memory.json</code>(用户画像字段化)+ 会话历史文件 + 每轮把「画像摘要 + 最近 N 条」注入窗口——可作为「记住我」功能的起点；用自己的任务集评测覆盖率。等数据量大了再升级 mem0/Graphiti。工程的美德是渐进。
      </div>
    </Chapter>
  )
}
