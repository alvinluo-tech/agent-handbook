import CodeBlock from '../components/CodeBlock.jsx'
import { Chapter } from '../components/Bits.jsx'
import { FigContextWindow } from '../components/Diag.jsx'

export default function Ch04() {
  return (
    <Chapter ch={{
      id: 'ch04', num: 'CH.04', icon: '🎒', title: '上下文工程', en: 'CONTEXT ENGINEERING — THE NEW PROMPT ENGINEERING', mins: 16,
      quests: ['能列举上下文窗口里的 8 类内容', '理解 compaction 压缩与 note-taking', '知道 KV-cache 友好设计的 3 条原则', '会用 sub-agent 隔离脏上下文'],
    }}>
      <p>2024 年大家都在谈「提示工程」,2025 年 Anthropic 发表<a href="https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents" target="_blank" rel="noreferrer">《Effective Context Engineering for AI Agents》</a>之后,业界词换了:<strong>Context Engineering(上下文工程)</strong>。区别在哪?提示工程优化「一句话怎么说」;上下文工程优化「每一轮,窗口里到底应该有什么」——这是 Agent 工程的真正主战场。</p>

      <FigContextWindow />

      <h3>4.1 核心矛盾:窗口是稀缺资源</h3>
      <p>Agent 跑得越久,上下文越膨胀:工具结果动辄几千 token、网页抓取塞进几万字……但窗口有限、价格按量收、性能随长度衰减。上下文工程的第一性原理是 Anthropic 的说法——找到信息的<strong>「right altitude(恰当海拔)」</strong>:像给复杂代码写注释一样,保留高信号事实与细节,砍掉冗余。三条铁律:</p>
      <ul className="steps">
        <li><b>最小充分</b>每轮只放「解决当前步骤必需」的内容,历史靠检索按需召回。</li>
        <li><b>结构化</b>用清晰的分区与标记(任务/约束/状态),可读性即准确性。</li>
        <li><b>动态更新</b>窗口是活文档:完成的划掉,变化的更新,别堆尸体。</li>
      </ul>

      <h3>4.2 四大武器</h3>
      <div className="grid2">
        <div className="card idea">
          <span className="card-tag">① Compaction 压缩</span>
          <p style={{ margin: 0 }}>接近窗口上限时,把对话历史<strong>总结成一份摘要</strong>重启上下文,并保留关键状态(最近工具结果、当前计划)。Claude Code 的 /compact 就是这个。要点:摘要要保住「接下来还需要」的信息,而不是「发生过什么」的流水账。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">② Structured Note-taking 笔记</span>
          <p style={{ margin: 0 }}>让 Agent 把关键信息<strong>持久化到窗口之外</strong>的文件:NOTES.md、todo 列表、AGENTS.md。需要时再读回。本质是把「记忆」外置——Claude 的 memory tool、Manus 的 todo.md 都是这个思路。比压缩更精准,代价是要管理文件。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">③ Sub-agent 隔离</span>
          <p style={{ margin: 0 }}>脏活(读 50 个网页、翻全库代码)交给<strong>子 agent</strong>在独立上下文里干,只把 distilled(蒸馏后的)结论带回主循环。主上下文保持干净。这是 Claude Research 系统的核心设计(CH.12 展开)。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">④ Just-in-time 检索</span>
          <p style={{ margin: 0 }}>别预载知识,用的时候再取:轻量标识(文件路径/关键词)+ 随用随查。参考人类认知科学结论——<strong>专家靠检索,不靠背诵</strong>。与 CH.10 的 RAG 一脉相承。</p>
        </div>
      </div>

      <h3>4.3 KV-cache:被新手忽略的印钞机</h3>
      <p>大模型 API 对 prompt 前缀有缓存:符合模型与端点缓存条件的稳定前缀可按缓存价计费，并可能降低预填充延迟；读价、写价和有效期各家不同。Agent 循环每一轮都在「上一轮 + 新内容」上追加,天然适合缓存——<strong>前提是你别破坏前缀</strong>。Anthropic 给的三条原则:</p>
      <div className="card gold">
        <span className="card-tag">KV-cache 友好三原则</span>
        <ol style={{ margin: '4px 0 0' }}>
          <li><strong>保持前缀稳定</strong>:system prompt、工具定义放在最前,且不要在中间插入动态内容(时间戳、随机 ID 都是缓存杀手)。</li>
          <li><strong>只追加,不回改</strong>:让上下文成为 append-only 日志;必须修改时,把可变部分放窗口尾部。</li>
          <li><strong>显式标记断点</strong>:用 API 的 cache_control 把「稳定段」和「动态段」划开(如 Claude 的 prompt caching)。</li>
        </ol>
      </div>
      <p>缓存收益应分别记录普通输入、缓存读取、缓存写入与输出费用；高输入命中率不等于整任务费用同比例下降。参见<a href="https://developers.openai.com/api/docs/guides/prompt-caching" target="_blank" rel="noreferrer">OpenAI 缓存</a>与<a href="https://platform.claude.com/docs/en/build-with-claude/prompt-caching" target="_blank" rel="noreferrer">Claude 缓存计费</a>。</p>

      <h3>4.4 系统提示词:写在窗口最前面的宪法</h3>
      <p>系统提示是唯一<strong>每一轮都在场</strong>的文本,值得单独打磨。业界共识的结构:</p>
      <CodeBlock name="SYSTEM_PROMPT.SKELETON" code={`# 角色          你是……为谁服务,解决什么问题
# 能力边界      你能做什么/不能做什么(越诚实越稳)
# 环境与资源    可用工具一览 + 何时该用哪个
# 工作规范      分步规划、先查证后断言、完成即停
# 安全红线      禁止动作、敏感操作必须请求人工确认
# 输出契约      交付格式、引用来源、失败时的汇报方式

/* 经验:少用「你必须永远不要」式堆叠否定句;
   每条规则给一个「为什么」,模型的遵从率显著更高;
   规则过多时，按场景动态注入，并通过评测检查遵从情况。*/`} kind="核心片段" />

      <div className="card warn">
        <span className="card-tag">避坑 · 上下文腐烂(Context Rot)</span>
        窗口越长,模型对每个 token 的「注意力分辨率」越低——同类信息反复出现还会互相污染。症状:长会话后 Agent 忘了最初目标、重复犯错。药方:定期 compaction、关键目标在压缩后重申、用笔记文件保存「不忘事项」。
      </div>
      <div className="card tip">
        <span className="card-tag">实战 · 上下文自检五问</span>
        ① 这一轮,哪些内容是解当前步必需的?② 有没有 3 轮前就失效的信息还躺着?③ 工具结果是否可以裁剪成关键行?④ 前缀还稳定吗(cache 还在吗)?⑤ 最重要的事,是不是落在窗口头或尾?
      </div>
      <div className="card gold">
        <span className="card-tag">2026 趋势 · 从压缩到持久记忆</span>
        对 11 个代码 Agent 的源码研究(《Harness Engineering》，收录论文库)把<strong>持久记忆</strong>列为新的差异化方向，但样本中仍有 7/11 系统使用阈值压缩：二者互补。文件和记忆库保存跨会话状态，窗口承载当前工作集；记忆也可能错误或陈旧。订单、余额等事实须从授权业务系统核验，并保留来源与更新时间。
      </div>
    </Chapter>
  )
}
