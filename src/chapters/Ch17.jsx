import { useMemo, useState } from 'react'
import { Chapter } from '../components/Bits.jsx'
import { estimateTaskCost } from '../lib/cost.js'

/* Agent 月成本估算器:输入规模与循环参数,体验「轮数×token」如何放大账单 */
function CostCalculator() {
  const [dau, setDau] = useState(1000)
  const [turns, setTurns] = useState(6)
  const [inTok, setInTok] = useState(12000)
  const [outTok, setOutTok] = useState(600)
  const [priceIn, setPriceIn] = useState(2)   // 示例：2026-10-03 GPT-6.1 Sol 标准价
  const [priceCache, setPriceCache] = useState(0.1)
  const [priceWrite, setPriceWrite] = useState(2.5)
  const [priceOut, setPriceOut] = useState(10)
  const [cacheHit, setCacheHit] = useState(70)
  const [cacheWrite, setCacheWrite] = useState(10)
  const calc = useMemo(() => {
    const costPerTask = estimateTaskCost({ turns, inputTokens: inTok, outputTokens: outTok,
      inputPrice: priceIn, cachedPrice: priceCache, writePrice: priceWrite,
      outputPrice: priceOut, cacheHit, cacheWrite })
    const monthly = costPerTask * dau * 30
    return { costPerTask, monthly }
  }, [dau, turns, inTok, outTok, priceIn, priceCache, priceWrite, priceOut, cacheHit, cacheWrite])
  const fmt = (n) => n >= 1 ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${n.toFixed(3)}`
  const field = (label, val, set, step, suffix) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: 'var(--ink-soft)' }}>
      {label}
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="number" value={val} step={step} min="0" max={suffix === '%' ? 100 : undefined} onChange={(e) => {
          const value = Number(e.target.value)
          set(Number.isFinite(value) ? Math.min(suffix === '%' ? 100 : Number.MAX_SAFE_INTEGER, Math.max(0, value)) : 0)
        }}
          style={{ width: 96, border: '2px solid var(--ink)', background: 'var(--paper)', padding: '5px 8px', fontFamily: 'var(--font-mono)', fontSize: 13 }} />
        <span style={{ color: 'var(--ink-faint)' }}>{suffix}</span>
      </span>
    </label>
  )
  return (
    <div className="card idea">
      <span className="card-tag">互动 · Agent 月成本估算器</span>
      <p style={{ margin: '2px 0 12px', fontSize: 13.5 }}>按普通输入、缓存读取、缓存写入和输出分别计费。默认价是 2026-10-03 GPT-6.1 Sol 标准价示例，切换模型须改价。读写比例都是总输入的子项，写入最多占未命中的剩余输入；输出 token 已含推理用量。</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {field('日活任务数', dau, setDau, 100, '次/天')}
        {field('平均循环轮数', turns, setTurns, 1, '轮')}
        {field('每轮平均输入', inTok, setInTok, 1000, 'tok')}
        {field('每轮平均输出', outTok, setOutTok, 100, 'tok')}
        {field('输入单价', priceIn, setPriceIn, 0.5, '$/M')}
        {field('缓存读取单价', priceCache, setPriceCache, 0.01, '$/M')}
        {field('缓存写入单价', priceWrite, setPriceWrite, 0.1, '$/M')}
        {field('输出单价', priceOut, setPriceOut, 1, '$/M')}
        {field('缓存命中率', cacheHit, setCacheHit, 5, '%')}
        {field('缓存写入占比', cacheWrite, setCacheWrite, 5, '%')}
      </div>
      <div className="term" style={{ margin: '14px 0 0' }}>
        <div className="term-bar">COST_ESTIMATE.OUT</div>
        <div className="term-body" style={{ minHeight: 0 }}>
          <span className="dim">单任务成本 ≈ </span><span className="out">{fmt(calc.costPerTask)}</span>
          <span className="dim">   (共 {turns} 轮 · 总输入 {(inTok * turns).toLocaleString()} tok · 总输出 {(outTok * turns).toLocaleString()} tok)</span>{'\n'}
          <span className="dim">月账单(30 天 × {dau.toLocaleString()} 次)≈ </span><span className="tool">{fmt(calc.monthly)}</span>
        </div>
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--ink-faint)' }}>※ 估算不含模型切换、嵌入、搜索、沙箱等附加费用；缓存写入是否收费依模型和端点而异。核对<a href="https://developers.openai.com/api/docs/guides/prompt-caching" target="_blank" rel="noreferrer">官方计费</a>，再用真实 usage 与账单校准。</p>
    </div>
  )
}

export default function Ch17() {
  return (
    <Chapter ch={{
      id: 'ch17', num: 'CH.17', icon: '📡', title: '可观测性与成本', en: 'OBSERVABILITY, TRACING & COST ENGINEERING', mins: 13,
      quests: ['会读一条 agent trace(时间线+token)', '知道 prompt caching 省钱原理', '能列出延迟预算的大头', '会设置预算/轮数熔断'],
    }}>
      <p>Agent 上线那天,你就有了一个「黑盒员工」:它每天花你的钱、用你的权限、产出质量波动。可观测性(Observability)就是给它装上行车记录仪。好消息是:Agent 的行为天然是结构化事件流,装仪表比传统系统容易。</p>

      <h3>17.1 一条 Trace 读懂你的 Agent</h3>
      <div className="term">
        <div className="term-bar">教学示例 TRACE — TASK #4021 · 总耗时 47.2s · $0.083 · 状态 OK</div>
        <div className="term-body nowrap">{`├─ [0.0s]  user_task: 整理这份 CSV 并给出摘要
├─ [0.2s]  llm.call#1   in=1.2K out=0.3K  cache=HIT(省$0.002)  1.1s
│          → 计划: 读文件 → 清洗 → 统计 → 汇报 (4 步)
├─ [1.3s]  tool.run_python   code 12 行 → stdout 3 行   ok 0.8s
├─ [2.2s]  llm.call#2   in=2.8K(+工具结果) out=0.4K  cache=MISS  2.4s
│          → ⚠ 发现列 price 含 12 个缺失值 → 决定填充中位数
├─ [4.6s]  tool.run_python   清洗 + describe   ok 1.9s
├─ [6.5s]  llm.call#3   in=3.1K out=0.9K   41s ←⚠ 延迟大头!
└─ [47.2s] final_answer: 「清洗 512 行…核心结论: GMV 同比+18%…」`}</div>
      </div>
      <p>读 trace 只需四个数字:<strong>轮数</strong>(#3 轮就完成,健康)、<strong>token 流向</strong>(输入涨得快不快?cache 命中率?)、<strong>延迟大头</strong>(这次是 LLM#3,可能是长输出)、<strong>钱</strong>($0.083 一次,乘以日活就是月账单)。Langfuse/ LangSmith / Phoenix / AgentOps 都在干「把 trace 变好看」这件事,选型时核对 OpenTelemetry 接入、数据驻留与脱敏能力。</p>

      <h3>17.2 成本工程:省钱的优先级清单</h3>
      <ol className="steps">
        <li><b>缓存优先</b>稳定前缀可减少重复输入计算，但必须按读价、写价、有效期和资格条件核算；输入折扣不等于整任务节省比例。</li>
        <li><b>模型路由</b>简单步骤用小模型(CH.02)，困难节点增加推理预算；以同一评测集比较质量、延迟与费用。</li>
        <li><b>AI 网关</b>统一密钥、配额、路由与失败回退(LiteLLM / OpenRouter / Portkey 一类定位):换模型不改业务代码,预算控制集中一处。</li>
        <li><b>语义缓存</b>高频相似问题命中语义等价的旧答案时直接复用,省的是整次调用;注意按用户隔离缓存并设新鲜度,别把 A 的答案泄给 B。</li>
        <li><b>结果裁剪</b>工具输出进上下文前裁剪/分页——token 大头往往是工具结果不是对话。</li>
        <li><b>预算熔断</b>每任务设 token/费用上限,超了就降级或转人工(CH.03 的刹车)。</li>
        <li><b>批处理/离线化</b>非实时任务可评估批量接口；折扣、模型支持和完成时限按厂商当前规则确认。</li>
        <li><b>灰度与影子流量</b>新 prompt/新模型先「影子」运行、只记结果不生效,对比离线指标后再小流量灰度,放量前盯住熔断指标。</li>
      </ol>

      <CostCalculator />

      <h3>17.3 延迟:体验的隐形杀手</h3>      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>环节</th><th>教学范围示例，非实测或服务承诺</th><th>优化</th></tr></thead>
          <tbody>
            <tr><td>LLM 生成(大头)</td><td>1-30s/次 × N 轮</td><td>流式输出、并行工具调用、减少轮数、小模型跑简单步</td></tr>
            <tr><td>工具执行</td><td>100ms-分钟级</td><td>超时+重试、异步化、沙箱快照预热(CH.07)</td></tr>
            <tr><td>检索/RAG</td><td>50-500ms</td><td>向量库调优、缓存热门查询</td></tr>
            <tr><td>首响时间(TTFT)</td><td>0.3-3s</td><td>前缀短一点、缓存、区域就近部署</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card tip">
        <span className="card-tag">实战 · 上线检查单</span>
        ☐ trace 平台接入,按 task_id 组织(多 agent 要有任务树视图) ☐ 每任务有费用/轮数熔断 ☐ 失败样本自动入「复盘队列」 ☐ 周报:成本分布、成功率、P95 延迟、熔断触发次数 ☐ 告警接 on-call:成功率骤降 &gt; 阈值 ☐ 每季度一次故障演练:把工具超时/限流/返回垃圾数据注入一遍,看 agent 与熔断的反应。
      </div>
      <div className="card warn">
        <span className="card-tag">避坑 · 观测三宗罪</span>
        ① <strong>只看成功率不看轨迹</strong>——「结果对但过程危险」的定时炸弹全靠轨迹评估拆弹;② <strong>采样记录</strong>——按风险分级留存：错误与高风险任务优先完整记录，普通任务可采样；先脱敏并设置保留期限，权衡复现能力、成本与隐私;③ <strong>指标没有分母</strong>——「今天熔断了 5 次」是多是少?永远带上比率。
      </div>
    </Chapter>
  )
}
