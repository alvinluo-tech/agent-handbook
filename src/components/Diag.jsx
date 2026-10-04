import Figure from './Figure.jsx'
// 像素风 SVG 图解 · 第一批(循环/频谱/上下文/工具调用/MCP/沙箱)
const INK = '#33291f', PAPER = '#fffdf6', ACC = '#e4572e', BLUE = '#2e86ab',
  GREEN = '#4d9455', GOLD = '#f2b705', DARK = '#221c33',
  SOFT = '#5c4f3f', FAINT = '#8a7a63'
const CN = "'Microsoft YaHei','PingFang SC',sans-serif"
const MONO = "'Cascadia Code',Consolas,monospace"

function MDefs({ p }) {
  const mk = (id, c) => (
    <marker key={id} id={`${p}-${id}`} markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M0,0 L14,7 L0,14 Z" fill={c} />
    </marker>
  )
  return <defs>{mk('ink', INK)}{mk('gold', GOLD)}{mk('green', GREEN)}{mk('blue', BLUE)}{mk('red', ACC)}{mk('faint', FAINT)}{mk('paper', PAPER)}</defs>
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

/* ================= FIG.01 Agent 循环 ================= */
export function FigAgentLoop() {
  return (
    <Fig no="FIG.01" cap="Agent 循环:目标 → 思考 → 行动 → 观察 →(循环)→ 最终答案。循环体每转一圈,观察结果都会写回上下文;模型判断「任务完成」时退出循环。" vb="0 0 780 330">
      <MDefs p="al" />
      <PB x={16} y={110} w={118} h={84} f="#fbf3d9">
        <T x={75} y={144} s={14}>🎯 用户目标</T>
        <T x={75} y={166} s={11} c={SOFT} w={400}>User Goal</T>
      </PB>
      <PA d="M134,152 L190,152" />
      <PB x={196} y={96} w={204} h={112} f={PAPER}>
        <T x={298} y={128} s={15}>🧠 LLM 大脑</T>
        <T x={298} y={152} s={11.5} c={SOFT} w={400}>思考 · 规划 · 决策</T>
        <T x={298} y={172} s={11.5} c={SOFT} w={400}>Reasoning &amp; Planning</T>
        <T x={298} y={194} s={10} c={ACC}>要不要调用工具?</T>
      </PB>
      <rect x={488} y={76} width={272} height={222} fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="6 4" />
      <T x={624} y={316} s={11} c="#a07f10" w={700}>ACTION → OBSERVATION 循环体(可能转 N 圈)</T>
      <PB x={500} y={96} w={170} h={76} f="#e9f2f7">
        <T x={585} y={124} s={13.5}>🔧 工具调用</T>
        <T x={585} y={146} s={10.5} c={SOFT} w={400}>按 Schema 生成参数</T>
      </PB>
      <PA d="M400,134 L494,134" />
      <T x={447} y={124} s={10.5} c={GREEN}>需要工具</T>
      <PB x={500} y={208} w={170} h={76} f="#eef5e8">
        <T x={585} y={236} s={13.5}>🌍 环境 / 外部系统</T>
        <T x={585} y={258} s={10.5} c={SOFT} w={400}>API · DB · Shell · 浏览器</T>
      </PB>
      <PA d="M585,172 L585,202" />
      <PA d="M500,246 L298,246 L298,214" c={GOLD} dash="7 5" m="al-gold" />
      <T x={402} y={238} s={10.5} c="#a07f10">observation 观察结果回填上下文</T>
      <PB x={500} y={16} w={260} h={48} f={DARK}>
        <T x={630} y={46} s={14} c={GOLD}>🏁 最终答案 Final Answer</T>
      </PB>
      <PA d="M298,96 L298,44 L494,44" c={GREEN} dash="7 5" m="al-green" />
      <T x={382} y={64} s={10.5} c={GREEN}>无需工具 / 判断完成 → 退出循环</T>
      <T x={16} y={282} s={11} c={FAINT} w={400} a="start">※ 每转一圈上下文在增长 —— 这是 Agent 与普通 LLM 调用的本质区别。</T>
    </Fig>
  )
}

/* ================= FIG.02 Workflow vs Agent 频谱 ================= */
export function FigWorkflowVsAgent() {
  const steps = [
    { x: 20, y: 236, t: '单次 LLM 调用', s: 'One-shot', f: '#e9f2f7' },
    { x: 162, y: 196, t: '提示链', s: 'Prompt Chaining', f: '#e9f2f7' },
    { x: 304, y: 156, t: '路由', s: 'Routing', f: '#e9f2f7' },
    { x: 446, y: 116, t: '编排者+工作者', s: 'Orchestrator-Workers', f: '#fbf3d9' },
    { x: 588, y: 76, t: '自主 Agent', s: 'Autonomous Agent', f: '#fbeae4' },
  ]
  return (
    <Fig no="FIG.02" cap="从 Workflow 到 Agent 的频谱(对照 Anthropic《Building Effective Agents》):越往右,控制流越由模型动态决定,灵活但成本/延迟/风险越高。先选最简单的模式,确有必要再加复杂度。" vb="0 0 780 352">
      <MDefs p="sp" />
      {steps.map((st, i) => (
        <g key={i}>
          <PB x={st.x} y={st.y} w={168} h={72} f={st.f}>
            <T x={st.x + 84} y={st.y + 30} s={14}>{st.t}</T>
            <T x={st.x + 84} y={st.y + 52} s={10} c={SOFT} w={400} f={MONO}>{st.s}</T>
          </PB>
          {i < steps.length - 1 && <PA d={`M${st.x + 146},${st.y - 10} L${st.x + 182},${st.y - 30}`} />}
        </g>
      ))}
      <PA d="M40,322 L740,322" c={FAINT} m="sp-faint" />
      <T x={210} y={338} s={11.5} c={BLUE}>◀ 控制流:代码预定义(可预测、低延迟、便宜)</T>
      <T x={598} y={338} s={11.5} c={ACC}>控制流:模型动态决定(灵活、贵、需护栏)▶</T>
      <T x={390} y={30} s={12.5} c={SOFT}>「先用最简单的方案,只在确有必要时增加复杂度。」 — Anthropic</T>
      <T x={390} y={54} s={11.5} c={FAINT}>Workflow:LLM 沿开发者画好的路径走 / Agent:LLM 自己规划路径与工具</T>
    </Fig>
  )
}

/* ================= FIG.03 上下文窗口解剖 ================= */
export function FigContextWindow() {
  const segs = [
    { h: 30, f: '#e9f2f7', t: 'System Prompt · 角色 + 规则' },
    { h: 36, f: '#eef5e8', t: '工具定义 Tools(要精简、稳定)' },
    { h: 26, f: '#f3ecfa', t: '记忆检索(长期记忆)' },
    { h: 24, f: '#fbf3d9', t: '任务目标 / TODO' },
    { h: 46, f: '#efe6cd', t: '对话历史(可被压缩 Compaction)' },
    { h: 30, f: '#eef5e8', t: '笔记 Notes · Agentic Memory' },
    { h: 38, f: '#e9f2f7', t: '检索文档(RAG 注入)' },
    { h: 30, f: '#fbeae4', t: '工具结果(最容易膨胀!)' },
  ]
  let y = 84
  const rects = segs.map((s, i) => {
    const el = (
      <g key={i}>
        <rect x={72} y={y} width={368} height={s.h - 4} fill={s.f} stroke={INK} strokeWidth="2" />
        <T x={256} y={y + s.h / 2 - 3} s={11.5} w={700}>{s.t}</T>
      </g>
    )
    y += s.h
    return el
  })
  return (
    <Fig no="FIG.03" cap="上下文窗口解剖:它是 Agent 唯一的「工作内存」,格子有限且昂贵。上下文工程 = 决定什么进窗口、什么放外面、如何压缩与缓存。" vb="0 0 780 380">
      <MDefs p="cw" />
      <PB x={60} y={40} w={392} h={320} f={PAPER}>
        <rect x={60} y={40} width={392} height={30} fill={INK} />
        <T x={256} y={60} s={12} c={GOLD} f={MONO}>CONTEXT WINDOW — 有限 &amp; 昂贵</T>
      </PB>
      {rects}
      <T x={40} y={100} s={10} c={FAINT}>旧</T>
      <T x={40} y={330} s={10} c={FAINT}>新</T>
      <PA d="M40,110 L40,316" c={FAINT} m="cw-faint" />
      <PB x={488} y={56} w={264} h={84} f="#fbeae4">
        <T x={620} y={82} s={12.5} c={ACC}>① 稀缺资源</T>
        <T x={620} y={102} s={11} w={400} c={SOFT}>像背包格子:每个 token 都要</T>
        <T x={620} y={120} s={11} w={400} c={SOFT}>为「对任务有用」付费</T>
      </PB>
      <PB x={488} y={156} w={264} h={84} f="#fbf3d9">
        <T x={620} y={182} s={12.5}>② Lost in the Middle</T>
        <T x={620} y={202} s={11} w={400} c={SOFT}>窗口中部信息最易被忽略</T>
        <T x={620} y={220} s={11} w={400} c={SOFT}>关键内容放头尾、做好检索</T>
      </PB>
      <PB x={488} y={256} w={264} h={104} f="#eef5e8">
        <T x={620} y={282} s={12.5} c={GREEN}>③ KV-cache 友好设计</T>
        <T x={620} y={302} s={11} w={400} c={SOFT}>前缀稳定 · 只追加不回改</T>
        <T x={620} y={320} s={11} w={400} c={SOFT}>工具定义别放动态字段</T>
        <T x={620} y={338} s={11} w={400} c={SOFT}>命中率 = 真金白银的成本优势</T>
      </PB>
    </Fig>
  )
}

/* ================= FIG.04 工具调用时序 ================= */
export function FigToolCall() {
  const lanes = [
    { x: 90, t: '👤 用户', f: '#fbf3d9' },
    { x: 290, t: '🧠 Agent(LLM)', f: '#e9f2f7' },
    { x: 490, t: '⚙️ Runtime', f: '#eef5e8' },
    { x: 690, t: '🌐 外部 API', f: '#f3ecfa' },
  ]
  const msg = (y, x1, x2, label, c = INK, m = 'tc-ink', dash) => (
    <g>
      <PA d={`M${x1},${y} L${x2},${y}`} c={c} m={m} dash={dash} />
      <T x={(x1 + x2) / 2} y={y - 8} s={11} c={c === INK ? SOFT : c} w={700}>{label}</T>
    </g>
  )
  return (
    <Fig no="FIG.04" cap="一次 Function Calling 的完整时序:模型不执行代码,只产出结构化的「调用意图」;真正执行由 Runtime 完成(含权限校验),结果再写回上下文供下一轮推理。" vb="0 0 780 400">
      <MDefs p="tc" />
      {lanes.map((l, i) => (
        <g key={i}>
          <PB x={l.x - 78} y={28} w={156} h={46} f={l.f}>
            <T x={l.x} y={57} s={13}>{l.t}</T>
          </PB>
          <line x1={l.x} y1={74} x2={l.x} y2={368} stroke={FAINT} strokeWidth="2" strokeDasharray="4 5" />
        </g>
      ))}
      <g>
        <rect x={72} y={96} width={20} height={20} fill={ACC} />
        <T x={82} y={111} s={11} c="#fff">1</T>
      </g>
      {msg(128, 90, 290, '帮我查订单 #42 的物流')}
      <PB x={182} y={150} w={216} h={52} f={DARK}>
        <T x={290} y={171} s={9.5} c="#7ae5f2" f={MONO}>tool_call: get_logistics(</T>
        <T x={290} y={189} s={9.5} c="#7ef29d" f={MONO}>{'{"order_id": "42"}'}</T>
      </PB>
      <T x={290} y={222} s={10.5} c={FAINT} w={400}>模型只产出「调用意图」,不执行</T>
      <g>
        <rect x={272} y={236} width={20} height={20} fill={GOLD} />
        <T x={282} y={251} s={11} c={INK}>2</T>
      </g>
      {msg(268, 290, 490, '执行 tool call(校验权限 → 运行)')}
      <g>
        <rect x={472} y={266} width={20} height={20} fill={BLUE} />
        <T x={482} y={281} s={11} c="#fff">3</T>
      </g>
      {msg(298, 490, 690, 'GET /logistics/42', BLUE, 'tc-blue')}
      {msg(330, 690, 490, 'JSON 响应', GREEN, 'tc-green', '6 5')}
      {msg(356, 490, 290, '观察结果写回上下文', GOLD, 'tc-gold', '6 5')}
      <T x={390} y={392} s={11} c={FAINT}>此后 LLM 读到「观察」,继续推理:要么再调用工具,要么输出最终答案。</T>
    </Fig>
  )
}

/* ================= FIG.05 MCP 架构 ================= */
export function FigMcp() {
  const servers = [
    { y: 84, t: 'MCP Server · GitHub', out: 'GitHub API' },
    { y: 186, t: 'MCP Server · 数据库', out: 'PostgreSQL' },
    { y: 288, t: 'MCP Server · 浏览器', out: 'Playwright' },
  ]
  return (
    <Fig no="FIG.05" cap="MCP 架构：Host 经 Client 调用多个 Server。Server 提供 tools / resources / prompts；JSON-RPC 2.0，传输为 stdio 或 Streamable HTTP，SSE 可作为响应编码。2026-07-28 核心为无状态请求，旧初始化/会话通过兼容层处理。" vb="0 0 780 414">
      <MDefs p="mc" />
      <PB x={36} y={70} w={300} h={290} f="#e9f2f7">
        <T x={186} y={100} s={14}>🏗️ MCP Host</T>
        <T x={186} y={122} s={11} c={SOFT} w={400}>你的 Agent 应用 / IDE / 桌面端</T>
        {[168, 252, 336].map((cy, i) => (
          <g key={i}>
            <rect x={66} y={cy - 26} width={240} height={46} fill={PAPER} stroke={INK} strokeWidth="2.5" />
            <T x={186} y={cy - 5} s={12.5}>MCP Client {['①', '②', '③'][i]}</T>
            <T x={186} y={cy + 13} s={9.5} c={FAINT} f={MONO}>请求带版本与能力元信息</T>
          </g>
        ))}
      </PB>
      {servers.map((sv, i) => (
        <g key={i}>
          <PB x={470} y={sv.y} w={272} h={72} f="#fbf3d9">
            <T x={606} y={sv.y + 30} s={13.5}>{sv.t}</T>
            <T x={606} y={sv.y + 52} s={10.5} c={SOFT} w={400} f={MONO}>tools / resources / prompts</T>
          </PB>
          <PA d={`M336,${168 + i * 84} L464,${sv.y + 36}`} />
          <T x={606} y={sv.y + 94} s={10.5} c={FAINT} w={400}>↔ 外部系统:{sv.out}</T>
        </g>
      ))}
      <T x={390} y={40} s={11} c={SOFT}>2024-11 首发 · 2025-12 进入 AAIF · 当前规范 2026-07-28(无状态 / MRTR)</T>
      <T x={390} y={404} s={11.5} c={FAINT}>价值:M×N 集成变 M+N、工具生态复用;代价:多一层进程/权限治理,需防工具投毒与提权。</T>
    </Fig>
  )
}

/* ================= FIG.06 沙箱隔离光谱 ================= */
export function FigSandbox() {
  const lv = [
    { x: 24, t: '① 进程直接执行', s: '裸跑 AI 生成的代码', tag: '❌ 危险', f: '#fbeae4', sw: 3, cold: '冷启动 ~ms', note: '内核全暴露' },
    { x: 214, t: '② 容器 Docker', s: '文件系统/进程隔离', tag: '⚠ 共享内核', f: '#fbf3d9', sw: 5, cold: '冷启动 ~秒级', note: '逃逸风险低但非零' },
    { x: 404, t: '③ gVisor 拦截层', s: '用户态拦截系统调用', tag: '独立系统调用边界', f: '#e9f2f7', sw: 7, cold: '性能开销需按负载测量', note: 'Google 容器沙箱' },
    { x: 594, t: '④ Firecracker 微VM', s: '独立内核 · KVM 微虚拟机', tag: '独立客体内核', f: '#eef5e8', sw: 9, cold: '启动依快照/预热条件', note: 'E2B 等采用此路线' },
  ]
  return (
    <Fig no="FIG.06" cap="沙箱选型按威胁模型、兼容性、资源与网络权限判断。容器、gVisor、微 VM 不是固定安全排行榜；Daytona 的 OCI runner/namespace 与 E2B 的微 VM 实现应区分。启动与性能数字须注明测量条件。" vb="0 0 780 360">
      <MDefs p="sb" />
      {lv.map((l, i) => (
        <g key={i}>
          <PB x={l.x} y={86} w={162} h={190} f={l.f} sw={l.sw}>
            <T x={l.x + 81} y={118} s={13}>{l.t}</T>
            <T x={l.x + 81} y={140} s={10} c={SOFT} w={400}>{l.s}</T>
            <T x={l.x + 81} y={164} s={11} c={ACC}>{l.tag}</T>
          </PB>
          <rect x={l.x + 41} y={186} width={80} height={42} fill={DARK} />
          <T x={l.x + 81} y={205} s={10} c="#7ef29d" f={MONO}>💻 untrusted</T>
          <T x={l.x + 81} y={221} s={10} c="#7ae5f2" f={MONO}>code.exe</T>
          <T x={l.x + 81} y={252} s={9.5} c={FAINT} w={400}>{l.note}</T>
          <T x={l.x + 81} y={306} s={10.5} c={SOFT}>{l.cold}</T>
        </g>
      ))}
      <PA d="M40,340 L740,340" c={INK} m="sb-ink" />
      <T x={390} y={330} s={12}>按隔离边界与部署条件选择，并持续修补与验证</T>
      <T x={390} y={40} s={11} c={SOFT}>隔离 + 最小权限 + 网络策略 + 资源限额；WASM 可提供虚拟文件系统与受控宿主访问</T>
    </Fig>
  )
}
