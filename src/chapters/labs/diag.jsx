import Figure from '../../components/Figure.jsx'
// 实战工坊 · 像素风 SVG 架构图(FIG.15-22)
// 沿用 Diag/Diag2 的助手约定:PB 像素盒 / PA 像素箭头 / T 文本 / MDefs 箭头 defs
const INK = '#33291f', PAPER = '#fffdf6', ACC = '#e4572e', BLUE = '#2e86ab',
  GREEN = '#4d9455', GOLD = '#f2b705', PURP = '#7b5ea7', DARK = '#221c33',
  SOFT = '#5c4f3f', FAINT = '#8a7a63'
const CN = "'Microsoft YaHei','PingFang SC',sans-serif"
const MONO = "'Cascadia Code',Consolas,monospace"

function MDefs({ p }) {
  const mk = (id, c) => (
    <marker key={id} id={`${p}-${id}`} markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M0,0 L14,7 L0,14 Z" fill={c} />
    </marker>
  )
  return <defs>{mk('ink', INK)}{mk('gold', GOLD)}{mk('green', GREEN)}{mk('blue', BLUE)}{mk('red', ACC)}{mk('faint', FAINT)}</defs>
}
const T = ({ x, y, c = INK, s = 13, w = 700, a = 'middle', f, children }) => (
  <text x={x} y={y} fill={c} fontSize={s} fontWeight={w} textAnchor={a} fontFamily={f || CN}>{children}</text>
)
function PB({ x, y, w, h, f = PAPER, sw = 3, st = INK, children }) {
  return <g><rect x={x} y={y} width={w} height={h} fill={f} stroke={st} strokeWidth={sw} />{children}</g>
}
const PA = ({ d, c = INK, dash, m = 'ink' }) => (
  <path d={d} fill="none" stroke={c} strokeWidth="3" strokeDasharray={dash} markerEnd={`url(#${m})`} />
)
const Fig = Figure

/* ============ FIG.15 实战地图:三项目选型 ============ */
export function FigLabMap() {
  const cols = [
    {
      x: 30, f: '#e9f2f7', icon: '🎧', name: 'ATLAS 客服中台', scene: ['B2B SaaS 售后支持', '重复咨询比例须实测'],
      pts: ['混合检索 RAG + 工具调用', '升级人工 + 双层护栏', '关键词:可控 · 可信', '评测:golden set 回归'], ch: 'CH.05 · 10 · 16',
    },
    {
      x: 280, f: '#f3ecfa', icon: '🔬', name: 'SCOUT 深度研究局', scene: ['投研 / 咨询 / 市场调研', '一份报告 = 几十次搜索'],
      pts: ['orchestrator-worker 编排', 'token 预算 + 引用台账', '关键词:并行 · 溯源', '评测:可达性 + 引用支持率'], ch: 'CH.04 · 11 · 12',
    },
    {
      x: 530, f: '#fbeae4', icon: '🛡️', name: 'SENTINEL 审查哨兵', scene: ['研发效能 / DevOps', '首轮时延按仓库实测'],
      pts: ['diff 上下文 + 防幻觉评论', 'webhook 幂等 + 防注入', '关键词:信噪比 · 幂等', '评测:注入 bug 的回放'], ch: 'CH.14 · 15 · 16',
    },
  ]
  const spine = ['🔁 Loop 循环', '🎒 Context 上下文', '🔧 Tools 工具', '📏 Eval 评测', '🛡 Safety 护栏']
  return (
    <Fig no="FIG.15" cap="实战地图:三个项目分别演示客服、研究和代码审查场景。架构不同，但需要相同的循环、上下文、工具、评测与安全能力；图中不是行业采用率或本仓库实测成绩。" vb="0 0 780 470">
      <MDefs p="lb" />
      <T x={390} y={30} s={13} c={ACC}>先选战场 —— 三套架构,三种企业场景,学完可横向复制</T>
      {cols.map((c, i) => (
        <g key={i}>
          <PB x={c.x} y={52} w={220} h={280} f={c.f}>
            <T x={c.x + 110} y={88} s={15}>{c.icon} {c.name}</T>
            {c.scene.map((s, j) => <T key={j} x={c.x + 110} y={116 + j * 20} s={10.5} c={SOFT} w={400}>{s}</T>)}
            <line x1={c.x + 16} y1={162} x2={c.x + 204} y2={162} stroke={INK} strokeWidth="2" strokeDasharray="6 4" />
            {c.pts.map((s, j) => <T key={j} x={c.x + 110} y={188 + j * 24} s={10.5} w={500}>{s}</T>)}
            <T x={c.x + 110} y={306} s={9.5} c={ACC} f={MONO}>{c.ch}</T>
          </PB>
        </g>
      ))}
      <T x={390} y={366} s={11} c={SOFT}>— 三个项目共同锻造的五块通用肌肉(主线 chapters 已讲,这里上真战场)—</T>
      {spine.map((s, i) => (
        <g key={i}>
          <PB x={34 + i * 146} y={382} w={128} h={48} f={DARK}>
            <T x={98 + i * 146} y={412} s={10.5} c={GOLD}>{s}</T>
          </PB>
        </g>
      ))}
    </Fig>
  )
}

/* ============ FIG.16 ATLAS 总架构 ============ */
export function FigAtlasArch() {
  return (
    <Fig no="FIG.16" cap="ATLAS 总架构:一条受控主流水线。路由器(轻模型)决定走哪条支路;合成器(强模型)必须带引用;输出护栏不达标就拒答;升级判断把棘手会话体面地交给人。全程 trace + 成本记账。" vb="0 0 780 700">
      <MDefs p="lb" />
      {/* 主流程第一行 */}
      <PB x={36} y={28} w={150} h={52} f="#e9f2f7"><T x={111} y={60} s={12.5}>👤 用户消息</T></PB>
      <PA d="M186,54 L236,54" />
      <PB x={236} y={28} w={200} h={52} f="#eef5e8">
        <T x={336} y={48} s={12}>🛡 输入护栏</T><T x={336} y={68} s={9.5} c={SOFT} w={400}>PII 清洗 · 越狱检测</T>
      </PB>
      <PA d="M436,54 L486,54" />
      <PB x={486} y={28} w={200} h={52} f={DARK}>
        <T x={586} y={48} s={12} c={GOLD}>🧭 路由器 · 轻模型</T><T x={586} y={68} s={9.5} c="#9c92b8" w={400}>五选一,输出 JSON</T>
      </PB>
      {/* 三条支路 */}
      <PA d="M586,80 L146,150" m="lb-ink" />
      <PA d="M586,80 L390,150" m="lb-ink" />
      <PA d="M586,80 L634,150" m="lb-ink" />
      <PB x={36} y={150} w={220} h={96} f="#e9f2f7">
        <T x={146} y={180} s={12.5}>📚 支路 A · 混合检索</T>
        <T x={146} y={204} s={9.5} c={SOFT} w={400}>pgvector + 全文检索 + RRF</T>
        <T x={146} y={224} s={9.5} c={SOFT} w={400}>重排后带引用回答</T>
      </PB>
      <PB x={280} y={150} w={220} h={96} f="#fbf3d9">
        <T x={390} y={180} s={12.5}>🔧 支路 B · 业务工具</T>
        <T x={390} y={204} s={9.5} c={SOFT} w={400}>查订单 / 查工单 / 退款申请</T>
        <T x={390} y={224} s={9.5} c={SOFT} w={400}>Pydantic 校验 · 幂等执行</T>
      </PB>
      <PB x={524} y={150} w={220} h={96} f="#eef5e8">
        <T x={634} y={180} s={12.5}>💬 支路 C · 闲聊直答</T>
        <T x={634} y={204} s={9.5} c={SOFT} w={400}>寒暄/客套不走重管线</T>
        <T x={634} y={224} s={9.5} c={SOFT} w={400}>轻模型生成,省时省钱</T>
      </PB>
      {/* 合成 */}
      <PA d="M146,246 L300,300" />
      <PA d="M390,246 L390,300" />
      <PB x={215} y={300} w={350} h={64} f={DARK}>
        <T x={390} y={328} s={13} c={GOLD}>✍️ 合成器 · 强模型</T>
        <T x={390} y={350} s={9.5} c="#9c92b8" w={400}>带 [1][2] 引用生成 · 引用不足 → 拒答模板</T>
      </PB>
      <PB x={36} y={300} w={150} h={64} f="#f3ecfa">
        <T x={111} y={326} s={11}>🗂 会话状态</T><T x={111} y={346} s={9.5} c={SOFT} w={400}>Postgres 历史+画像</T>
      </PB>
      <PA d="M186,332 L215,332" c={PURP} m="lb-blue" />
      <PA d="M634,246 L634,424 L569,424" c={GREEN} dash="6 4" m="lb-green" />
      <T x={652} y={340} s={9.5} c={GREEN} a="start">闲聊直答</T>
      <T x={652} y={356} s={9.5} c={GREEN} a="start">绕过强模型</T>
      {/* 输出护栏 */}
      <PA d="M390,364 L390,396" />
      <PB x={215} y={396} w={350} h={56} f="#eef5e8">
        <T x={390} y={418} s={12}>🛡 输出护栏</T>
        <T x={390} y={438} s={9.5} c={SOFT} w={400}>引用覆盖率 · 事实核查 · 语气 · PII 泄漏</T>
      </PB>
      {/* 升级判断 */}
      <PA d="M390,452 L390,494" />
      <PB x={290} y={494} w={200} h={48} f="#fbeae4">
        <T x={390} y={514} s={12}>🚦 升级判断</T><T x={390} y={532} s={9.5} c={SOFT} w={400}>置信度 / 情绪 / 政策规则</T>
      </PB>
      <PA d="M330,542 L170,590" c={GREEN} m="lb-green" />
      <T x={196} y={556} s={10} c={GREEN}>✔ 通过</T>
      <PA d="M450,542 L540,590" c={ACC} m="lb-red" />
      <T x={548} y={556} s={10} c={ACC}>⚠ 命中</T>
      <PB x={80} y={590} w={180} h={56} f="#eef5e8"><T x={170} y={624} s={12.5}>📨 自动回复用户</T></PB>
      <PB x={420} y={590} w={240} h={56} f="#fbeae4">
        <T x={540} y={614} s={12.5}>🙋 升级人工工单</T>
        <T x={540} y={634} s={9.5} c={SOFT} w={400}>上下文包:对话+检索+trace</T>
      </PB>
      <T x={390} y={678} s={10} c={FAINT}>全程 trace:每步耗时 / token / 成本写入 JSONL → 喂给评测与回归(见 M5)</T>
    </Fig>
  )
}

/* ============ FIG.17 混合检索与拒答 ============ */
export function FigAtlasRag() {
  return (
    <Fig no="FIG.17" cap="ATLAS 的检索管线:双路召回互补(向量管语义改写,关键词管 SKU/报错码),RRF 融合免去调权之苦,cross-encoder 重排把精度再拉一档。分数不足就拒答——客服场景,「不知道」永远好过「编一个」。" vb="0 0 780 500">
      <MDefs p="lb" />
      <PB x={290} y={20} w={200} h={48} f="#e9f2f7"><T x={390} y={50} s={12.5}>❓ 用户问题</T></PB>
      <PA d="M340,68 L196,120" m="lb-blue" />
      <PA d="M440,68 L584,120" c={BLUE} m="lb-blue" />
      <PB x={56} y={120} w={280} h={96} f="#e9f2f7">
        <T x={196} y={148} s={12.5}>🔎 稠密检索 Dense</T>
        <T x={196} y={172} s={9.5} c={SOFT} w={400}>pgvector 余弦相似 · 取 top-50</T>
        <T x={196} y={192} s={9.5} c={SOFT} w={400}>擅长:「怎么开发票」这类语义改写</T>
      </PB>
      <PB x={444} y={120} w={280} h={96} f="#fbf3d9">
        <T x={584} y={148} s={12.5}>🔍 稀疏检索 Sparse</T>
        <T x={584} y={172} s={9.5} c={SOFT} w={400}>Postgres FTS(tsvector)· 取 top-50</T>
        <T x={584} y={192} s={9.5} c={SOFT} w={400}>擅长:SKU / 报错码 / 型号等精确词</T>
      </PB>
      <PA d="M196,216 L330,262" />
      <PA d="M584,216 L450,262" />
      <PB x={215} y={262} w={350} h={48} f={DARK}>
        <T x={390} y={284} s={12} c={GOLD}>⚖️ RRF 倒数排名融合</T>
        <T x={390} y={302} s={9.5} c="#9c92b8" w={400}>score = Σ 1/(60+rank) · 两路排名合并,免调权</T>
      </PB>
      <PA d="M390,310 L390,348" />
      <PB x={215} y={348} w={350} h={52} f="#f3ecfa">
        <T x={390} y={370} s={12}>🎯 Cross-encoder 重排</T>
        <T x={390} y={390} s={9.5} c={SOFT} w={400}>top-50 → top-5 · 小模型即可胜任</T>
      </PB>
      <PA d="M390,400 L390,438" />
      <PB x={215} y={438} w={350} h={48} f="#eef5e8">
        <T x={390} y={468} s={11.5}>📨 Top-5 片段编号 [1]-[5] → 注入 Prompt</T>
      </PB>
      <PA d="M565,374 L620,374" c={ACC} m="lb-red" />
      <PB x={620} y={348} w={140} h={52} f="#fbeae4">
        <T x={690} y={368} s={10.5} c={ACC}>🚫 分数过低</T>
        <T x={690} y={386} s={10.5} c={ACC}>→ 诚实拒答</T>
      </PB>
    </Fig>
  )
}

/* ============ FIG.18 升级决策 ============ */
export function FigAtlasEscalate() {
  return (
    <Fig no="FIG.18" cap="ATLAS 升级判断:三类信号(规则/自信度/情绪)并行检查,任一命中就转人工,并把完整上下文包交给客服——人工接手时「所见即所得」。升级不是失败,是最重要的产品功能。" vb="0 0 780 440">
      <MDefs p="lb" />
      <PB x={215} y={20} w={350} h={48} f={DARK}>
        <T x={390} y={50} s={12.5} c={GOLD}>🚦 升级判断 · 每次合成回复后全量跑</T>
      </PB>
      <PA d="M390,68 L149,104" m="lb-ink" />
      <PA d="M390,68 L390,104" m="lb-ink" />
      <PA d="M390,68 L631,104" m="lb-ink" />
      <PB x={36} y={104} w={226} h={92} f="#e9f2f7">
        <T x={149} y={132} s={12}>R1 · 规则引擎</T>
        <T x={149} y={156} s={9.5} c={SOFT} w={400}>退款 / 投诉 / 法务关键词</T>
        <T x={149} y={174} s={9.5} c={SOFT} w={400}>确定性命中,一票升级</T>
      </PB>
      <PB x={277} y={104} w={226} h={92} f="#fbf3d9">
        <T x={390} y={132} s={12}>R2 · 自信度</T>
        <T x={390} y={156} s={9.5} c={SOFT} w={400}>自评 &lt; 0.75 / 引用不足</T>
        <T x={390} y={174} s={9.5} c={SOFT} w={400}>工具连续失败两次</T>
      </PB>
      <PB x={518} y={104} w={226} h={92} f="#f3ecfa">
        <T x={631} y={132} s={12}>R3 · 情绪与身份</T>
        <T x={631} y={156} s={9.5} c={SOFT} w={400}>愤怒 / 紧急措辞检测</T>
        <T x={631} y={174} s={9.5} c={SOFT} w={400}>VIP 客户直接升级</T>
      </PB>
      <PA d="M149,196 L330,240" />
      <PA d="M390,196 L390,240" />
      <PA d="M631,196 L450,240" />
      <PB x={290} y={240} w={200} h={44} f={PAPER}>
        <T x={390} y={268} s={11.5} f={MONO}>any(R1, R2, R3) ?</T>
      </PB>
      <PA d="M330,284 L205,330" c={GREEN} m="lb-green" />
      <T x={216} y={300} s={10} c={GREEN}>false</T>
      <PA d="M450,284 L575,330" c={ACC} m="lb-red" />
      <T x={566} y={300} s={10} c={ACC}>true</T>
      <PB x={80} y={330} w={250} h={64} f="#eef5e8">
        <T x={205} y={356} s={12}>✅ 自动发送</T>
        <T x={205} y={376} s={9.5} c={SOFT} w={400}>+ 24h 满意度回访(CSAT 采样)</T>
      </PB>
      <PB x={440} y={330} w={270} h={64} f="#fbeae4">
        <T x={575} y={356} s={12}>🙋 升级人工</T>
        <T x={575} y={376} s={9.5} c={SOFT} w={400}>上下文包入队 · SLA 倒计时 · 去重合并</T>
      </PB>
      <T x={390} y={426} s={10} c={FAINT}>升级 ≠ 失败:把棘手问题体面地交给人,是客服 Agent 最重要的产品功能</T>
    </Fig>
  )
}

/* ============ FIG.19 SCOUT 架构 ============ */
export function FigScoutArch() {
  return (
    <Fig no="FIG.19" cap="SCOUT 总架构：Lead 拆解与预算，Workers 在独立上下文中并行搜索，台账统一编号，交叉校验后分节合成。Anthropic 2025 年研究系统的多 Agent 约耗普通聊天 15 倍 token，这是历史基线，非 SCOUT 的实测倍率。" vb="0 0 780 690">
      <MDefs p="lb" />
      <PB x={250} y={16} w={280} h={48} f="#f3ecfa"><T x={390} y={46} s={12.5}>❓ 研究问题(常带歧义)</T></PB>
      <PA d="M390,64 L390,96" />
      <PB x={215} y={96} w={350} h={52} f="#e9f2f7">
        <T x={390} y={118} s={12}>🗣 澄清轮(最多 2 次)</T>
        <T x={390} y={138} s={9.5} c={SOFT} w={400}>时间范围 / 地域 / 口径 —— 缺啥问啥,不瞎猜</T>
      </PB>
      <PA d="M390,148 L390,180" />
      <PB x={165} y={180} w={450} h={68} f={DARK}>
        <T x={390} y={206} s={13} c={GOLD}>🧠 Lead Agent · 产出研究计划 JSON</T>
        <T x={390} y={230} s={9.5} c="#9c92b8" w={400}>拆 3-5 个子问题 · 逐题分配预算与努力档 · 总预算熔断(超支降档)</T>
      </PB>
      <PA d="M240,248 L146,290" />
      <PA d="M390,248 L390,290" />
      <PA d="M540,248 L634,290" />
      <PB x={36} y={290} w={220} h={100} f="#f3ecfa">
        <T x={146} y={318} s={12.5}>🐭 WORKER-1</T>
        <T x={146} y={342} s={9.5} c={SOFT} w={400}>上下文独立 · 搜索+抓取</T>
        <T x={146} y={360} s={9.5} c={SOFT} w={400}>只回 500-1000 词压缩结论</T>
        <T x={146} y={378} s={9.5} c={SOFT} w={400}>失败不影响兄弟任务</T>
      </PB>
      <PB x={280} y={290} w={220} h={100} f="#f3ecfa">
        <T x={390} y={318} s={12.5}>🐭 WORKER-2</T>
        <T x={390} y={342} s={9.5} c={SOFT} w={400}>并行工具调用 ·SQLite 缓存</T>
        <T x={390} y={360} s={9.5} c={SOFT} w={400}>超预算即停</T>
        <T x={390} y={378} s={9.5} c={SOFT} w={400}>摘录必须带原文 URL</T>
      </PB>
      <PB x={524} y={290} w={220} h={100} f="#f3ecfa">
        <T x={634} y={318} s={12.5}>🐭 WORKER-N(3-5)</T>
        <T x={634} y={342} s={9.5} c={SOFT} w={400}>asyncio + 信号量控并发</T>
        <T x={634} y={360} s={9.5} c={SOFT} w={400}>努力档:low/med/high</T>
        <T x={634} y={378} s={9.5} c={SOFT} w={400}>高努力 = 多搜几轮</T>
      </PB>
      <PA d="M146,390 L300,430" />
      <PA d="M390,390 L390,430" />
      <PA d="M634,390 L480,430" />
      <PB x={165} y={430} w={450} h={52} f="#fbf3d9">
        <T x={390} y={452} s={12}>📒 Citation Ledger 引用台账</T>
        <T x={390} y={472} s={9.5} c={SOFT} w={400}>URL 去重 → 全局编号 C1..Cn → claim ↔ source 双向映射</T>
      </PB>
      <PA d="M300,482 L210,514" />
      <PA d="M480,482 L570,514" c={FAINT} dash="6 4" m="lb-faint" />
      <PB x={60} y={514} w={300} h={52} f="#e9f2f7">
        <T x={210} y={536} s={12}>🔍 交叉校验</T>
        <T x={210} y={556} s={9.5} c={SOFT} w={400}>多源冲突检测 · 低置信显式标注</T>
      </PB>
      <PB x={420} y={514} w={300} h={52} f="#eef5e8">
        <T x={570} y={536} s={12}>✍️ 分节撰写 → 编辑合成</T>
        <T x={570} y={556} s={9.5} c={SOFT} w={400}>每节引用自己的 C 编号 · 统一风格</T>
      </PB>
      <PA d="M360,540 L420,540" />
      <PA d="M570,566 L420,596" />
      <PB x={165} y={596} w={450} h={52} f={PAPER}>
        <T x={390} y={618} s={12}>📄 研究简报</T>
        <T x={390} y={638} s={9.5} c={SOFT} w={400}>分节正文 + 引用表 + 置信标注 + 完整审计 trace</T>
      </PB>
      <T x={390} y={676} s={10} c={ACC}>💰 成本按本任务实测：包含查询、挑页、提炼、写作与校验调用</T>
    </Fig>
  )
}

/* ============ FIG.20 引用台账 ============ */
export function FigScoutLedger() {
  return (
    <Fig no="FIG.20" cap="引用台账:全局唯一的 URL→编号映射。多个 Worker 撞到同一来源只记一条;每条引用都要过「链接可达 + 摘录支持结论」验证,按结果三档处置。宁可少引用,不可假引用。" vb="0 0 780 400">
      <MDefs p="lb" />
      <PB x={30} y={130} w={190} h={110} f="#f3ecfa">
        <T x={125} y={160} s={12}>🧾 Worker 回报</T>
        <T x={125} y={186} s={9.5} c={SOFT} w={400}>每条结论附 raw URL</T>
        <T x={125} y={206} s={9.5} c={SOFT} w={400}>+ 原文摘录(quote)</T>
      </PB>
      <PA d="M220,185 L280,185" />
      <PB x={280} y={48} w={250} h={280} f="#fbf3d9">
        <T x={405} y={76} s={12.5}>📒 台账(全局唯一)</T>
        <line x1={296} y1={90} x2={514} y2={90} stroke={INK} strokeWidth="2" />
        <T x={296} y={114} s={9.5} a="start" f={MONO}>C1 arxiv.org/2402.x</T>
        <T x={296} y={132} s={9} c={SOFT} a="start" w={400}>└ W1,W3 撞源,合并为一条</T>
        <T x={296} y={158} s={9.5} a="start" f={MONO}>C2 reuters.com/…</T>
        <T x={296} y={176} s={9} c={SOFT} a="start" w={400}>└ W2 · 摘录已存正文</T>
        <T x={296} y={202} s={9.5} a="start" f={MONO}>C3 blog.example ⚠</T>
        <T x={296} y={220} s={9} c={ACC} a="start" w={400}>└ 抓取 404 → 标记失效</T>
        <T x={296} y={246} s={9.5} a="start" f={MONO}>C4 docs.official/…</T>
        <T x={296} y={264} s={9} c={SOFT} a="start" w={400}>└ 一手来源 · 权重最高</T>
        <T x={405} y={306} s={9} c={FAINT} w={400}>claim ↔ source 双向可查</T>
      </PB>
      <PA d="M530,108 L590,108" />
      <PB x={590} y={48} w={160} h={120} f="#e9f2f7">
        <T x={670} y={76} s={12}>✅ 逐条验证</T>
        <T x={670} y={102} s={9.5} c={SOFT} w={400}>链接可达?</T>
        <T x={670} y={122} s={9.5} c={SOFT} w={400}>摘录真的支持</T>
        <T x={670} y={140} s={9.5} c={SOFT} w={400}>这个结论吗?</T>
      </PB>
      <PA d="M670,168 L670,210" />
      <PB x={590} y={210} w={160} h={140} f={PAPER}>
        <T x={670} y={236} s={11.5}>🚦 三档处置</T>
        <T x={670} y={262} s={9.5} c={GREEN} w={400}>通过 → 标 [C1]</T>
        <T x={670} y={284} s={9.5} c={GOLD} w={400}>存疑 →『据报道』</T>
        <T x={670} y={306} s={9.5} c={ACC} w={400}>失效 → 剔除/换源</T>
        <T x={670} y={330} s={9} c={FAINT} w={400}>结果写回 trace</T>
      </PB>
      <T x={390} y={380} s={10} c={FAINT}>链接可访问 ≠ 结论被支持；引用支持率需原文核对与人工校准</T>
    </Fig>
  )
}

/* ============ FIG.21 SENTINEL 流水线 ============ */
export function FigSentinelArch() {
  return (
    <Fig no="FIG.21" cap="SENTINEL 流水线:webhook 验签幂等入队 → 上下文组装(diff hunk 优先)→ 确定性规则与 LLM 双引擎并行 → 自校验丢弃无证据 finding → 去重与评论预算 → 回写 GitHub。新 push 只增量重审。" vb="0 0 780 660">
      <MDefs p="lb" />
      <PB x={30} y={24} w={210} h={64} f="#fbeae4">
        <T x={135} y={50} s={12}>🪝 GitHub Webhook</T><T x={135} y={70} s={9.5} c={SOFT} w={400}>PR opened / synchronize</T>
      </PB>
      <PA d="M240,56 L290,56" />
      <PB x={290} y={24} w={200} h={64} f="#fbf3d9">
        <T x={390} y={50} s={12}>🔑 验签 + 幂等</T><T x={390} y={70} s={9.5} c={SOFT} w={400}>HMAC · delivery id 去重</T>
      </PB>
      <PA d="M490,56 L540,56" />
      <PB x={540} y={24} w={210} h={64} f="#e9f2f7">
        <T x={645} y={50} s={12}>📥 轻量队列</T><T x={645} y={70} s={9.5} c={SOFT} w={400}>削峰 · 超时熔断 · 失败降级</T>
      </PB>
      <PA d="M645,88 L645,180 L504,180" />
      <PB x={280} y={140} w={220} h={80} f={DARK}>
        <T x={390} y={168} s={12} c={GOLD}>🧩 上下文组装</T>
        <T x={390} y={190} s={9.5} c="#9c92b8" w={400}>diff hunks + 所在文件 + 规范</T>
        <T x={390} y={208} s={9.5} c="#9c92b8" w={400}>≤ token 预算,优先级见 FIG.22</T>
      </PB>
      <PA d="M330,220 L210,270" />
      <PA d="M450,220 L570,270" />
      <PB x={60} y={270} w={300} h={84} f="#eef5e8">
        <T x={210} y={298} s={12}>⚙️ 确定性规则引擎 · 0 token</T>
        <T x={210} y={322} s={9.5} c={SOFT} w={400}>密钥泄漏 / 危险 API / 文件规模突变</T>
        <T x={210} y={340} s={9.5} c={SOFT} w={400}>已知模式可重复检查；测漏报与误报</T>
      </PB>
      <PB x={420} y={270} w={300} h={84} f="#f3ecfa">
        <T x={570} y={298} s={12}>🤖 LLM 审查 · 结构化输出</T>
        <T x={570} y={322} s={9.5} c={SOFT} w={400}>findings: [file, line, severity,</T>
        <T x={570} y={340} s={9.5} c={SOFT} w={400}>category, claim, evidence, suggestion]</T>
      </PB>
      <PA d="M210,354 L330,390" />
      <PA d="M570,354 L450,390" />
      <PB x={240} y={390} w={300} h={56} f="#fbeae4">
        <T x={390} y={412} s={12}>⚖️ 自校验 pass</T>
        <T x={390} y={432} s={9.5} c={SOFT} w={400}>行号不存在 / 证据不符 → 直接丢弃</T>
      </PB>
      <PA d="M390,446 L390,480" />
      <PB x={240} y={480} w={300} h={56} f="#fbf3d9">
        <T x={390} y={502} s={12}>🧹 去重 + 评论预算</T>
        <T x={390} y={522} s={9.5} c={SOFT} w={400}>指纹去重 · 已解决线程抑制 · 默认每 PR ≤ 6 条</T>
      </PB>
      <PA d="M390,536 L390,570" />
      <PB x={240} y={570} w={300} h={56} f={DARK}>
        <T x={390} y={592} s={12} c={GOLD}>💬 回写 GitHub Review</T>
        <T x={390} y={612} s={9.5} c="#9c92b8" w={400}>按 severity 分级 · 高危才 REQUEST_CHANGES</T>
      </PB>
      <PA d="M540,598 L762,598 L762,180 L508,180" c={GREEN} dash="6 4" m="lb-green" />
      <T x={700} y={420} s={9.5} c={GREEN} a="start">🔁 新 push</T>
      <T x={700} y={436} s={9.5} c={GREEN} a="start">增量重审:</T>
      <T x={700} y={452} s={9.5} c={GREEN} a="start">只看新 diff</T>
      <T x={390} y={650} s={10} c={FAINT}>⏱ SLO:webhook → 首条评论 &lt; 60s(排队 + 组装 + 2 次 LLM 调用)</T>
    </Fig>
  )
}

/* ============ FIG.22 上下文优先级与评论防线 ============ */
export function FigSentinelBudget() {
  const row = (px, y, no, t, s, c = INK) => (
    <g key={`${px}-${y}`}>
      <rect x={px + 4} y={y - 14} width={22} height={22} fill={c} stroke={INK} strokeWidth="2" />
      <T x={px + 15} y={y + 2} s={10} c="#fff" f={MONO}>{no}</T>
      <T x={px + 38} y={y + 2} s={11} a="start" w={600}>{t}</T>
      <T x={px + 38} y={y + 19} s={9} c={SOFT} a="start" w={400}>{s}</T>
    </g>
  )
  return (
    <Fig no="FIG.22" cap="SENTINEL 上下文与评论预算：优先保留 diff；改动本身超限时拆分任务，背景按剩余额度装填。评论去重后按严重度排序，默认每 PR 最多 6 条，额外建议记录在 trace 中。" vb="0 0 780 320">
      <MDefs p="lb" />
      <PB x={16} y={24} w={364} h={272} f="#e9f2f7">
        <T x={198} y={52} s={12.5}>📦 上下文组装的优先级</T>
        <T x={198} y={70} s={9} c={FAINT} w={400}>预算内自上而下填充</T>
        {row(28, 104, '1', 'diff hunk 本体(逐行带行号)', '独占预算,永不裁剪', ACC)}
        {row(28, 150, '2', 'hunk 所在文件的完整函数', '改动的直接现场', BLUE)}
        {row(28, 196, '3', '被调 / 调用方的签名+docstring', '判断接口契约是否被破坏', GREEN)}
        {row(28, 242, '4', '仓库规范 CONVENTIONS.md 摘要', '团队风格与红线', GOLD)}
        <T x={198} y={280} s={9} c={ACC} w={400}>装不下?砍 4 → 砍 3,永不砍 1</T>
      </PB>
      <PB x={400} y={24} w={364} h={272} f="#fbeae4">
        <T x={582} y={52} s={12.5}>🔕 评论信噪比三道防线</T>
        <T x={582} y={70} s={9} c={FAINT} w={400}>信任是审查工具唯一的资产</T>
        {row(412, 104, '1', 'severity 门槛:minor / nitpick 不发', '宁可少说,不可啰嗦', ACC)}
        {row(412, 150, '2', '预算:默认每 PR ≤ 6 条', '额外建议记录 trace', BLUE)}
        {row(412, 196, '3', '指纹去重:hash(file,line,category)', '已解决线程不再重提', GREEN)}
        <T x={582} y={246} s={9.5} c={SOFT} a="start" w={400}>同一条评论,在一个 PR 里是 nitpick,</T>
        <T x={582} y={264} s={9.5} c={SOFT} a="start" w={400}>在另一个 PR 里可能是致命伤 —— 所以</T>
        <T x={582} y={282} s={9.5} c={ACC} a="start" w={400}>逐条判 severity,不做全局一刀切。</T>
      </PB>
    </Fig>
  )
}
