import { useEffect, lazy, Suspense } from 'react'
import { useChecks } from '../../lib/progress.js'
import { navigate, parseRoute, useLocationHash } from '../../lib/navigation.js'

const Overview = lazy(() => import('./overview.jsx'))
const P1a = lazy(() => import('./p1a.jsx'))
const P1b = lazy(() => import('./p1b.jsx'))
const P1c = lazy(() => import('./p1c.jsx'))
const P2a = lazy(() => import('./p2a.jsx'))
const P2b = lazy(() => import('./p2b.jsx'))
const P2c = lazy(() => import('./p2c.jsx'))
const P3a = lazy(() => import('./p3a.jsx'))
const P3b = lazy(() => import('./p3b.jsx'))
const P3c = lazy(() => import('./p3c.jsx'))
import { LABS } from './registry.js'

const KEYS = ['overview', ...LABS.map((l) => l.key)]

export default function LabsPage() {
  const hash = useLocationHash()
  const { path, params } = parseRoute(hash)
  const candidate = path.startsWith('lab-') ? path.slice(4) : 'overview'
  const active = KEYS.includes(candidate) ? candidate : 'overview'
  const go = (key) => { if (KEYS.includes(key)) navigate(key === 'overview' ? 'lab' : `lab-${key}`) }
  useEffect(() => { if (!params.get('section')) window.scrollTo({ top: 0, behavior: 'instant' }) }, [hash])

  // 各项目通关进度(勾选数),显示在标签上
  const checks = useChecks()
  const done = (lab) => {
    const set = new Set((checks[lab.qid] || []).filter((i) => i < lab.quests.length))
    return `${set.size}/${lab.quests.length}`
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="ch-meta">
          <span className="ch-level">SIDE QUEST</span>
          <span className="ch-mins">⏱ 教学建议每项目 2-3 周 · 🔨 3 个需集成与验证的实战项目</span>
        </div>
        <h1 className="ch-title">实战工坊</h1>
        <div className="ch-en">BUILD, INTEGRATE & EVALUATE — 3 AGENT ENGINEERING LABS</div>
      </div>

      <div className="toolbar lab-tabs">
        <button aria-pressed={active === 'overview'} className={`chip ${active === 'overview' ? 'on' : ''}`} onClick={() => go('overview')}>
          📜 工坊大厅
        </button>
        {LABS.map((lab) => (
          <button key={lab.key} aria-pressed={active === lab.key} className={`chip ${active === lab.key ? 'on' : ''}`} onClick={() => go(lab.key)}>
            {lab.icon} {lab.code} {lab.title.split(' · ')[1]} <span className="cnt">{done(lab)}</span>
          </button>
        ))}
      </div>

      <Suspense fallback={<p role="status">正在载入项目…</p>}>
      {active === 'overview' && <Overview onGo={go} />}
      {active === 'p1' && <><P1a /><P1b /><P1c onGo={go} /></>}
      {active === 'p2' && <><P2a /><P2b /><P2c onGo={go} /></>}
      {active === 'p3' && <><P3a /><P3b /><P3c onGo={go} /></>}
      </Suspense>
    </div>
  )
}
