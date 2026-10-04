import CodeBlock from '../../components/CodeBlock.jsx'
import { navigate } from '../../lib/navigation.js'
import { QuestList } from '../../components/Bits.jsx'

/* ---------- 项目大标题卡(进入项目时的第一屏) ---------- */
export function LabHead({ lab, scene, stack, rivals, resume, points }) {
  return (
    <div className="lab-hero">
      <div className="lab-hero-top">
        <span className="lab-badge">{lab.code}</span>
        <span className="lab-lv">{lab.level}</span>
        <span className="lab-weeks">⏱ {lab.weeks}</span>
        <span className="lab-rival">对标: {rivals}</span>
      </div>
      <h2 className="lab-title">{lab.icon} {lab.title}</h2>
      <div className="ch-en">{lab.en}</div>
      <div className="lab-hero-grid">
        <div><i>🎯 教学业务场景</i><p>{scene}</p></div>
        <div><i>🧰 技术栈</i><p>{stack}</p></div>
        <div><i>📜 简历句式模板</i><p>{resume}</p></div>
        <div><i>🎓 带走的能力</i><p>{points}</p></div>
      </div>
    </div>
  )
}

/* ---------- 里程碑小节(带锚点) ---------- */
export function Mile({ id, no, title, children }) {
  return (
    <section id={id} className="mile">
      <h3 className="mile-h">
        <span className="mile-no">{no}</span>
        <span>{title}</span>
      </h3>
      {children}
    </section>
  )
}

/* ---------- 代码文件块(带复制按钮) ---------- */
export const CodeFile = CodeBlock

/* ---------- 项目文件树 ---------- */
export function FileTree({ name, children }) {
  return (
    <div className="filetree">
      <div className="filetree-head">{name}</div>
      <pre>{children}</pre>
    </div>
  )
}

/* ---------- 指标卡行 ---------- */
export function Kpis({ items, label = "验收目标 / 配置示例，非仓库实测成果" }) {
  return (
    <div><p style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>{label}</p><div className="kpis">
      {items.map(([v, k], i) => (
        <div key={i} className="kpi"><b>{v}</b><span>{k}</span></div>
      ))}
    </div></div>
  )
}

/* ---------- 技术决策记录(ADR 式表格) ---------- */
export function Adr({ rows }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr><th style={{ width: '21%' }}>✅ 决策</th><th style={{ width: '20%' }}>🤔 备选方案</th><th style={{ width: '33%' }}>为什么这么选</th><th>代价与缓解</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td><b>{r[0]}</b></td>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
              <td>{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- 简历写法卡 ---------- */
export function Res({ children }) {
  return <div className="card gold"><span className="card-tag">📜 简历句式模板</span><p style={{ fontSize: 13 }}>以下仅是表达模板。填写自己的样本量、模型快照、实测结果与证据；未完成或未测得的能力不要写成已交付成果。</p>{children}</div>
}

/* ---------- 本项目路标(锚点导航) ---------- */
export function LabToc({ items }) {
  return (
    <div className="lab-toc">
      <div className="lab-toc-head">◆ 本项目路标 · 建议按顺序推进</div>
      <div className="lab-toc-row">
        {items.map((it, i) => (
          <button key={i} className="lab-toc-item" onClick={() => navigate(window.location.hash.slice(1).split('?')[0], { section: it.id })}>
            <b>{it.no}</b>
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- 项目底部:通关清单 + 上下项目切换 ---------- */
export function LabFoot({ lab, onGo, keys }) {
  const idx = keys.indexOf(lab.key)
  const prev = idx > 0 ? keys[idx - 1] : null
  const next = idx < keys.length - 1 ? keys[idx + 1] : null
  return (
    <>
      <QuestList id={lab.qid} items={lab.quests} />
      <div className="lab-nav">
        {prev
          ? <button className="px-btn ghost" onClick={() => onGo(prev)}>◀ 上一关</button>
          : <span />}
        {next
          ? <button className="px-btn" onClick={() => onGo(next)}>下一关 ▶</button>
          : <button className="px-btn blue" onClick={() => onGo('overview')}>返回工坊大厅 🏠</button>}
      </div>
    </>
  )
}
