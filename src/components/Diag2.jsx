import Figure from './Figure.jsx'
// 像素风 SVG 图解 · 第二批(记忆/RAG/多智能体/协议时间线/Eval飞轮/路线图/公式)
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

/* ================= FIG.07 记忆分层 ================= */
export function FigMemory() {
  const tiers = [
    { y: 64, t: '🧩 核心记忆块 Core Memory', s: '常驻窗口:用户画像 · 偏好 · 项目背景(agent 可直接编辑)', f: '#fbf3d9' },
    { y: 152, t: '💬 回忆存储 Recall Storage', s: '完整对话历史,按需检索回窗口', f: '#e9f2f7' },
    { y: 232, t: '📚 档案记忆 Archival Memory', s: '向量库 / 知识库,语义检索,容量无限', f: '#eef5e8' },
    { y: 312, t: '🛠 程序性记忆 Procedures', s: '技能库 · 工作流 · NOTES.md / AGENTS.md 等笔记文件', f: '#f3ecfa' },
  ]
  return (
    <Fig no="FIG.07" cap="Agent 记忆分层(MemGPT 开创的「记忆操作系统」思路):上下文窗口是宝贵的工作记忆,其余放外部存储,由 Agent 自己决定何时读写——记忆即分页。" vb="0 0 780 410">
      <MDefs p="mm" />
      <PB x={36} y={120} w={280} h={120} f="#fbeae4">
        <T x={176} y={152} s={14}>🪟 上下文窗口</T>
        <T x={176} y={176} s={11} c={SOFT} w={400}>工作记忆 · 有限格位</T>
        <T x={176} y={198} s={10.5} c={FAINT} w={400}>对话 / 目标 / 工具结果</T>
        <T x={176} y={222} s={10.5} c={ACC}>会话结束即消失(除非持久化)</T>
      </PB>
      <PB x={80} y={292} w={200} h={64} f={DARK}>
        <T x={180} y={330} s={13} c={GOLD}>🤖 Agent 自管理</T>
      </PB>
      {tiers.map((t, i) => (
        <g key={i}>
          <PB x={396} y={t.y} w={352} h={64} f={t.f}>
            <T x={572} y={t.y + 26} s={12.5}>{t.t}</T>
            <T x={572} y={t.y + 47} s={10} c={SOFT} w={400}>{t.s}</T>
          </PB>
          <PA d={`M280,${152 + i * 8} L390,${t.y + 32}`} c={BLUE} m="mm-blue" />
          <PA d={`M390,${t.y + 44} L280,${160 + i * 8}`} c={GREEN} dash="6 4" m="mm-green" />
        </g>
      ))}
      <T x={335} y={96} s={10} c={BLUE}>读取 ▶</T>
      <T x={335} y={396} s={10} c={GREEN}>◀ 写入(store / edit)</T>
      <T x={180} y={262} s={10.5} c={FAINT} w={400}>MemGPT 隐喻:LLM = OS,窗口 = 内存,外部 = 磁盘</T>
    </Fig>
  )
}

/* ================= FIG.08 RAG 流水线 ================= */
export function FigRag() {
  const boxes = (items, y, colors) => items.map((t, i) => (
    <g key={i}>
      <PB x={26 + i * 186} y={y} w={158} h={64} f={colors[i % colors.length]}>
        <T x={105 + i * 186} y={y + 38} s={12.5}>{t}</T>
      </PB>
      {i < items.length - 1 && <PA d={`M${184 + i * 186},${y + 32} L${206 + i * 186},${y + 32}`} />}
    </g>
  ))
  return (
    <Fig no="FIG.08" cap="RAG 双流水线:离线把知识切块、向量化入库;在线把问题向量化检索 Top-K、重排后注入 Prompt。Agentic RAG 则由 Agent 自主决定「何时检索、检索什么、结果够不够好」。" vb="0 0 780 398">
      <MDefs p="rg" />
      <T x={26} y={48} s={12.5} c={BLUE} a="start">▌离线索引 Offline Indexing</T>
      {boxes(['📄 文档收集', '✂️ 切块 Chunking', '🧮 Embedding 向量化', '🗄️ 向量数据库'], 64, ['#e9f2f7', '#eef5e8', '#fbf3d9', '#f3ecfa'])}
      <PA d="M735,128 L735,208" c={FAINT} m="rg-faint" />
      <T x={762} y={172} s={10} c={FAINT}>知识待命</T>
      <T x={26} y={200} s={12.5} c={ACC} a="start">▌在线查询 Online Query</T>
      {boxes(['❓ 用户问题', '🔎 向量检索 Top-K', '📊 重排 Rerank', '📝 注入 Prompt'], 236, ['#e9f2f7', '#eef5e8', '#fbf3d9', '#f3ecfa'])}
      <PA d="M712,268 L712,338 L400,338" c={INK} m="rg-ink" />
      <PB x={216} y={312} w={176} h={52} f={DARK}>
        <T x={304} y={344} s={13} c={GOLD}>🧠 LLM 生成答案</T>
      </PB>
      <PA d="M304,364 L304,374" c={GREEN} m="rg-green" />
      <T x={304} y={390} s={10.5} c={GREEN}>✅ 带引用的可信回答</T>
    </Fig>
  )
}

/* ================= FIG.09 多智能体拓扑 ================= */
export function FigMultiAgent() {
  const node = (x, y, c = PURP) => <rect x={x - 14} y={y - 14} width={28} height={28} fill={c} stroke={INK} strokeWidth="2.5" />
  return (
    <Fig no="FIG.09" cap="多智能体拓扑：中心编排适合可并行拆分、集中校验的任务；去中心网络与层级树有不同通信和协调成本。应按任务、权限与评测选择，不能指定通用生产首选。" vb="0 0 780 380">
      <MDefs p="ma" />
      {/* 1 supervisor */}
      <PB x={20} y={56} w={232} h={252} f="#e9f2f7">
        <T x={136} y={86} s={13.5}>① 中心编排 Supervisor</T>
        {node(136, 160, ACC)}
        {[[52, 262], [108, 262], [164, 262], [220, 262]].map(([x, y], i) => (
          <g key={i}>
            <line x1={136} y1={174} x2={x} y2={y - 16} stroke={INK} strokeWidth="2.5" />
            {node(x, y, BLUE)}
          </g>
        ))}
        <T x={136} y={296} s={10.5} c={SOFT} w={400}>Lead 分解任务 → Workers 执行 → 汇总</T>
      </PB>
      {/* 2 mesh */}
      <PB x={274} y={56} w={232} h={252} f="#fbf3d9">
        <T x={390} y={86} s={13.5}>② 去中心网络 Mesh</T>
        {(() => {
          const pts = [[326, 170], [454, 170], [326, 248], [454, 248]]
          const lines = [[0, 1], [0, 2], [1, 3], [2, 3], [0, 3]]
          return (
            <g>
              {lines.map(([a, b], i) => (
                <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={INK} strokeWidth="2.5" />
              ))}
              {pts.map(([x, y], i) => <g key={`n${i}`}>{node(x, y)}</g>)}
            </g>
          )
        })()}
        <T x={390} y={296} s={10.5} c={SOFT} w={400}>Agent 对等互联,handoff 交接控制权</T>
      </PB>
      {/* 3 hierarchy */}
      <PB x={528} y={56} w={232} h={252} f="#eef5e8">
        <T x={644} y={86} s={13.5}>③ 层级树 Hierarchy</T>
        {node(644, 136, ACC)}
        <line x1={644} y1={150} x2={584} y2={190} stroke={INK} strokeWidth="2.5" />
        <line x1={644} y1={150} x2={704} y2={190} stroke={INK} strokeWidth="2.5" />
        {node(584, 204, PURP)}{node(704, 204, PURP)}
        <line x1={584} y1={218} x2={556} y2={248} stroke={INK} strokeWidth="2.5" />
        <line x1={584} y1={218} x2={612} y2={248} stroke={INK} strokeWidth="2.5" />
        <line x1={704} y1={218} x2={676} y2={248} stroke={INK} strokeWidth="2.5" />
        <line x1={704} y1={218} x2={732} y2={248} stroke={INK} strokeWidth="2.5" />
        {[[556, 262], [612, 262], [676, 262], [732, 262]].map(([x, y], i) => <g key={i}>{node(x, y, BLUE)}</g>)}
        <T x={644} y={296} s={10.5} c={SOFT} w={400}>经理→主管→工人,大工程分解</T>
      </PB>
      <T x={136} y={40} s={10.5} c={ACC}>可并行拆分 / 集中校验</T>
      <T x={390} y={40} s={11.5} c="#a07f10">灵活但失控风险高</T>
      <T x={644} y={40} s={11.5} c={GREEN}>适合超大规模任务</T>
      <T x={390} y={352} s={11.5} c={FAINT}>经验法则:能用单 Agent + 好工具解决,就别上多 Agent(成本×N、上下文传递损耗、失败面×N)。</T>
    </Fig>
  )
}

/* ================= FIG.10 协议时间线 ================= */
export function FigProtocolTimeline() {
  const events = [
    { x: 80, y: 142, up: true, d: '2023.06', t: 'Function Calling', s: '结构化调用意图', c: BLUE },
    { x: 210, y: 142, up: false, d: '2024.11', t: 'MCP', s: '工具 / 数据接入', c: ACC },
    { x: 340, y: 142, up: true, d: '2025.04', t: 'A2A', s: '6 月进入 Linux 基金会', c: GREEN },
    { x: 470, y: 142, up: false, d: '2025.05', t: 'x402 / AG-UI', s: 'HTTP 支付 / 前端事件', c: PURP },
    { x: 590, y: 142, up: true, d: '2025.09', t: 'AP2 / ACP', s: '授权 mandates / 商务', c: '#a07f10' },
    { x: 700, y: 142, up: false, d: '2025.12', t: 'MCP → AAIF', s: '捐赠中立基金会', c: ACC },
    { x: 150, y: 306, up: false, d: '2026.01', t: 'UCP', s: '商务与履约接口', c: BLUE },
    { x: 390, y: 306, up: false, d: '2026.07', t: 'MCP 新规范', s: '无状态 / MRTR', c: ACC },
    { x: 630, y: 306, up: false, d: '2026.08', t: 'A2A → AAIF', s: '治理归属更新', c: GREEN },
  ]
  return (
    <Fig no="FIG.10" cap="协议时间线核查于 2026-10-03。区分首发与治理/规范更新：x402 于 2025-05 发布，AP2/ACP 于 2025-09，UCP 于 2026-01；MCP 当前规范为 2026-07-28，A2A 于 2026-08 进入 AAIF 治理。各协议存在交叠，不能把图当成无竞争的固定层级。" vb="0 0 780 440">
      <MDefs p="pt" />
      <PA d="M40,142 L752,142" c={FAINT} m="pt-faint" />
      <PA d="M40,306 L752,306" c={FAINT} m="pt-faint" />
      {events.map((e, i) => (
        <g key={i}>
          <rect x={e.x - 9} y={e.y - 9} width={18} height={18} fill={e.c} stroke={INK} strokeWidth="2.5" />
          <line x1={e.x} y1={e.up ? e.y - 9 : e.y + 9} x2={e.x} y2={e.up ? e.y - 38 : e.y + 38} stroke={INK} strokeWidth="2.5" />
          <T x={e.x} y={e.up ? e.y - 50 : e.y + 58} s={10.5} c={e.c} f={MONO}>{e.d}</T>
          <T x={e.x} y={e.up ? e.y - 70 : e.y + 78} s={11}>{e.t}</T>
          <T x={e.x} y={e.up ? e.y - 88 : e.y + 98} s={9} c={SOFT} w={400}>{e.s}</T>
        </g>
      ))}
      <T x={390} y={280} s={11} c={SOFT}>2026 · 继续区分首发、协议版本与治理迁移</T>
      <T x={390} y={432} s={10} c={FAINT}>接入须核对版本、能力、授权和商家支持；同一协议的治理迁移不等于首次发布。</T>
    </Fig>
  )
}

/* ================= FIG.11 Eval 飞轮 ================= */
export function FigEvalLoop() {
  const nodes = [
    { x: 390, y: 56, t: '① 构建黄金任务集', s: '真实场景 · 50~200 条', f: '#e9f2f7' },
    { x: 636, y: 168, t: '② 跑 Eval', s: 'pass@k · 轨迹评分', f: '#fbf3d9' },
    { x: 390, y: 280, t: '③ 分析失败轨迹', s: '错在检索?工具?推理?', f: '#fbeae4' },
    { x: 144, y: 168, t: '④ 定点改进', s: 'prompt / 工具 / 上下文', f: '#eef5e8' },
  ]
  return (
    <Fig no="FIG.11" cap="评估驱动开发飞轮:先建黄金任务集,再跑分、析错、定点改进、循环。Agent 的能力=模型×脚手架(harness),而 harness 优化只能靠 eval 引导。" vb="0 0 780 340">
      <MDefs p="ev" />
      {nodes.map((n, i) => (
        <g key={i}>
          <PB x={n.x - 110} y={n.y - 34} w={220} h={68} f={n.f}>
            <T x={n.x} y={n.y - 8} s={13}>{n.t}</T>
            <T x={n.x} y={n.y + 14} s={10.5} c={SOFT} w={400}>{n.s}</T>
          </PB>
        </g>
      ))}
      <PA d="M506,56 L610,140" c={BLUE} m="ev-blue" />
      <PA d="M636,208 L520,262" c={ACC} m="ev-red" />
      <PA d="M274,268 L160,208" c={GOLD} m="ev-gold" />
      <PA d="M150,132 L280,62" c={GREEN} m="ev-green" />
      <PB x={310} y={138} w={160} h={60} f={DARK}>
        <T x={390} y={162} s={13} c={GOLD}>EVAL 飞轮</T>
        <T x={390} y={182} s={9.5} c="#cfc7e0" w={400} f={MONO}>eval-driven-dev</T>
      </PB>
      <T x={390} y={326} s={11} c={FAINT}>辅助手段:LLM-as-judge(要校准)· 人类抽检 · 线上 A/B · 轨迹级 vs 结果级评分</T>
    </Fig>
  )
}

/* ================= FIG.12 学习路线图 ================= */
export function FigRoadmap() {
  const stops = [
    { x: 110, y: 290, lv: 'STAGE 1', t: '打地基 · CH.01-04', s: ['LLM 原理 · 提示工程', '上下文窗口'], f: '#e9f2f7' },
    { x: 300, y: 140, lv: 'STAGE 2', t: '造循环 · CH.05-08', s: ['Agent Loop · 工具/MCP', '第一个可用 Agent'], f: '#fbf3d9' },
    { x: 480, y: 290, lv: 'STAGE 3', t: '上强度 · CH.09-16', s: ['记忆 · RAG · 沙箱', '评估 · 安全'], f: '#eef5e8' },
    { x: 670, y: 140, lv: 'STAGE 4', t: '成大师 · CH.17-19', s: ['可观测 · 协议生态', '多智能体 · 前沿'], f: '#fbeae4' },
  ]
  return (
    <Fig no="FIG.12" cap="小白 → 大师的四段进化路线(详细周计划见下方):打地基 → 造循环 → 上强度 → 成大师。每一段都有明确的「能做出的东西」作为里程碑。" vb="0 0 780 400">
      <MDefs p="rm" />
      <PA d="M110,290 L300,140 L480,290 L670,140" c={FAINT} dash="8 6" m="rm-faint" />
      <T x={34} y={378} s={11} c={INK} f={MONO} a="start">▶ START</T>
      {stops.map((s, i) => (
        <g key={i}>
          <PB x={s.x - 90} y={s.y - 70} w={180} h={50} f={s.f}>
            <T x={s.x} y={s.y - 50} s={11} c={ACC} f={MONO}>{s.lv}</T>
            <T x={s.x} y={s.y - 31} s={12.5}>{s.t}</T>
          </PB>
          <rect x={s.x - 13} y={s.y - 13} width={26} height={26} fill={ACC} stroke={INK} strokeWidth="3" />
          <PB x={s.x - 90} y={s.y + 18} w={180} h={58} f={PAPER} sw={2}>
            {s.s.map((ln, j) => (
              <T key={j} x={s.x} y={s.y + 42 + j * 19} s={10.5} c={SOFT} w={400}>{ln}</T>
            ))}
          </PB>
        </g>
      ))}
      <PB x={652} y={22} w={116} h={40} f={GOLD}>
        <T x={710} y={47} s={12}>★ MASTER!</T>
      </PB>
      <T x={390} y={394} s={10.5} c={FAINT}>里程碑判定:能写好 prompt → 能造可用 Agent → 记得住事、查到料、跑得安全 → 能架构生产级多智能体系统。</T>
    </Fig>
  )
}

/* ================= FIG.00 Agent 公式 ================= */
export function FigFormula() {
  const parts = [
    { x: 30, t: '🧠', l1: 'LLM', l2: '推理引擎', f: '#e9f2f7' },
    { x: 178, t: '🔧', l1: '工具', l2: '手脚', f: '#eef5e8' },
    { x: 326, t: '🔁', l1: '循环', l2: '自主性来源', f: '#fbf3d9' },
    { x: 474, t: '🧠', l1: '记忆', l2: '经验积累', f: '#f3ecfa' },
    { x: 622, t: '🛡️', l1: '护栏', l2: '安全边界', f: '#fbeae4' },
  ]
  return (
    <Fig no="FIG.00" cap="Agent 的万能公式:LLM 提供推理,工具提供行动力,循环提供自主性,记忆提供连续性,护栏兜住安全。本书全部章节都在展开这五个词。" vb="0 0 780 200">
      <MDefs p="fm" />
      {parts.map((p, i) => (
        <g key={i}>
          <PB x={p.x} y={40} w={120} h={110} f={p.f}>
            <text x={p.x + 60} y={80} textAnchor="middle" fontSize="26">{p.t}</text>
            <T x={p.x + 60} y={110} s={14}>{p.l1}</T>
            <T x={p.x + 60} y={132} s={10.5} c={SOFT} w={400}>{p.l2}</T>
          </PB>
          {i < parts.length - 1 && <T x={p.x + 134} y={100} s={22} c={FAINT}>+</T>}
        </g>
      ))}
      <PB x={30} y={158} w={712} h={34} f={DARK}>
        <T x={386} y={181} s={13} c={GOLD}>= 🤖 AGENT —— 能自主感知、决策、行动以达成目标的系统</T>
      </PB>
    </Fig>
  )
}
