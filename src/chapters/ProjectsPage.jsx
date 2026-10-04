import { useLocationHash, parseRoute, navigate, updateFilters } from '../lib/navigation.js'
import { useMemo } from 'react'
import projectsData from '../data/projects.json'

const CATS = [
  { key: 'all', cn: '全部' },
  { key: 'frameworks', cn: '框架与编排' },
  { key: 'coding', cn: '代码智能体' },
  { key: 'browser', cn: '浏览器与 GUI' },
  { key: 'memory', cn: '记忆 / RAG 设施' },
  { key: 'apps', cn: '应用与产品' },
  { key: 'obs', cn: '可观测与评估' },
  { key: 'sandbox', cn: '沙箱运行时' },
  { key: 'mcp', cn: '协议生态' },
  { key: 'learn', cn: '学习资源' },
]

const fmtStars = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`)
const fmtDate = (iso) => {
  if (!iso) return '未记录'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '未记录' : date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' })
}

export default function ProjectsPage() {
  const { params } = parseRoute(useLocationHash())
  const cat = CATS.some((c) => c.key === params.get('cat')) ? params.get('cat') : 'all'
  const q = params.get('q') || ''
  const maintenance = params.get('state') || ''
  const setCat = (cat) => navigate('projects', { cat, q, state: maintenance })
  const { repos, failed, fetchedAt } = projectsData

  const counts = useMemo(() => {
    const c = { all: repos.length }
    for (const r of repos) c[r.cat] = (c[r.cat] || 0) + 1
    return c
  }, [repos])

  const shown = useMemo(() => repos.filter((r) => cat === 'all' || r.cat === cat).filter((r) => !q || `${r.slug} ${r.description} ${r.why}`.toLowerCase().includes(q.toLowerCase())).filter((r) => !maintenance || (maintenance === 'archived' ? r.archived : !r.archived)), [cat, repos, q, maintenance])

  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), Math.max(1, Math.ceil(shown.length / 20)))
  const visible = shown.slice((page - 1) * 20, page * 20)
  return (
    <div className="page">
      <div className="page-head">
        <div className="ch-meta">
          <span className="ch-level">EXTRA · 支线</span>
          <span className="ch-mins">⚔️ {repos.length} 个项目 · GitHub API 快照起始于 {fmtDate(fetchedAt)}(UTC+8)，含后续增补</span>
        </div>
        <h1 className="ch-title">GitHub 兵器谱</h1>
        <div className="ch-en">GITHUB ARSENAL — SOURCE SNAPSHOTS &amp; STUDY NOTES</div>
      </div>

      <div className="card gold" style={{ marginTop: 26 }}>
        <span className="card-tag">收录标准</span>
        主要收录<strong>具有学习价值的高星项目</strong>，Star 与 push 时间来自定期采集的静态快照，浏览时不实时请求 GitHub；历史增补条目可能来自不同采集时刻。
        已归档项目保留作历史学习参考，并明确标注状态。Star 不代表质量或生产成熟度；挑同类项目比较设计、维护状态与适用场景。
        {failed && failed.length > 0 && <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--ink-faint)' }}>另有 {failed.length} 个仓库(MCP 生态/学习资源类)因 API 限流暂未入库:{failed.join('、')}</p>}
      </div>

      <div className="toolbar">
        {CATS.map((c) => (
          <button key={c.key} aria-pressed={cat === c.key} className={`chip ${cat === c.key ? 'on' : ''}`} onClick={() => setCat(c.key)}>
            {c.cn}<span className="cnt">×{counts[c.key] || 0}</span>
          </button>
        ))}
      </div>

      <label htmlFor="project-search">搜索项目名称与导读</label>
      <input id="project-search" className="search-input" type="search" value={q} onChange={(e) => updateFilters({ q: e.target.value, page: '' })} />
      <label htmlFor="project-state">维护状态</label>
      <select id="project-state" value={maintenance} onChange={(e) => navigate('projects', { cat, q, state: e.target.value })}><option value="">全部状态</option><option value="active">未归档</option><option value="archived">已归档</option></select>
      <div className="result-controls"><span role="status">匹配 {shown.length} 个 · 第 {page}/{Math.max(1, Math.ceil(shown.length / 20))} 页</span><button onClick={() => navigate('projects')}>清空搜索与筛选</button></div>
      {visible.map((r) => (
        <div className="repo-card" key={r.slug}>
          <div className="repo-top">
            <span className="repo-name"><a href={r.url} target="_blank" rel="noreferrer">{r.slug}</a></span>
            <span className="repo-stars">★ {fmtStars(r.stars)}</span>
            {r.archived && <span className="repo-arch">已归档 · 历史参考</span>}
            <span className="repo-meta" style={{ marginLeft: 'auto' }}>更新 {fmtDate(r.pushedAt)}{r.stale && <span title="本轮采集被限流,保留上次成功快照"> · 快照沿用</span>}</span>
          </div>
          <div className="repo-desc">{r.description}</div>
          <div className="repo-why">💡 {r.why}</div>
          <div className="repo-meta">forks {fmtStars(r.forks)} · issues {r.openIssues} · 创建 {fmtDate(r.createdAt)} · 采集 {fmtDate(r.fetchedAt || fetchedAt)}{r.stale ? '(旧)' : ''}</div>
        </div>
      ))}
      {!shown.length && <p>没有匹配的项目，试试清空筛选。</p>}
      <nav className="pagination" aria-label="项目分页"><button disabled={page <= 1} onClick={() => navigate('projects', { cat, q, state: maintenance, page: page - 1 })}>上一页</button><button disabled={page * 20 >= shown.length} onClick={() => navigate('projects', { cat, q, state: maintenance, page: page + 1 })}>下一页</button></nav>
    </div>
  )
}
