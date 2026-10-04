import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { CHAPTERS, EXTRAS } from './chapters/index.js'
import RobotSprite from './components/RobotSprite.jsx'
import PixelIcon, { CH_ICON, EXTRA_ICON } from './components/PixelIcon.jsx'
import { LABS } from './chapters/labs/registry.js'
import resourceSummary from './data/resource-summary.json'
import { useChecks } from './lib/progress.js'
import { navigate, parseRoute, useLocationHash } from './lib/navigation.js'
import { copyText } from './lib/clipboard.js'
import versionData from './data/version.json'

const PapersPage = lazy(() => import('./chapters/PapersPage.jsx'))
const ProjectsPage = lazy(() => import('./chapters/ProjectsPage.jsx'))
const LabsPage = lazy(() => import('./chapters/labs/LabsPage.jsx'))
const EXTRA_DEFS = [
  { key: 'lab', icon: '🔨', label: '实战工坊', sub: 'LB' },
  { key: 'papers', icon: '📚', label: '论文军火库', sub: 'PA' },
  { key: 'projects', icon: '⚔️', label: 'GitHub 兵器谱', sub: 'GH' },
  { key: 'roadmap', icon: '🗺️', label: '进化路线图', sub: 'RM' },
  { key: 'glossary', icon: '🎴', label: '术语图鉴 & FAQ', sub: 'GL' },
  { key: 'versions', icon: '📜', label: '版本管理', sub: 'VR' },
]
const loading = <p className="page" role="status">正在载入内容…</p>

export default function App() {
  const hash = useLocationHash()
  const { path, params } = parseRoute(hash)
  const chapter = CHAPTERS.find((ch) => ch.id === path)
  const view = chapter ? 'chapter' : path.startsWith('lab') ? 'lab' : path || 'home'
  const checks = useChecks()
  const [navOpen, setNavOpen] = useState(false)
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 880px)').matches)
  const [storageMessage, setStorageMessage] = useState('')
  const menu = useRef(null), sidebar = useRef(null), main = useRef(null), progressBar = useRef(null)
  const section = params.get('section')

  useEffect(() => {
    const media = window.matchMedia('(max-width: 880px)')
    const changed = () => { setMobile(media.matches); setNavOpen(false) }
    const go = (e) => navigate(e.detail === 'labs' ? 'lab' : e.detail)
    const failed = () => setStorageMessage('浏览器未允许保存进度，本次勾选仅在当前页面有效。')
    media.addEventListener('change', changed)
    window.addEventListener('adg-go', go)
    window.addEventListener('adg-storage-unavailable', failed)
    return () => { media.removeEventListener('change', changed); window.removeEventListener('adg-go', go); window.removeEventListener('adg-storage-unavailable', failed) }
  }, [])

  useEffect(() => {
    if (!mobile || !navOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = sidebar.current.querySelector('button, a')
    first?.focus()
    const key = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); setNavOpen(false) }
      if (e.key !== 'Tab') return
      const all = [...sidebar.current.querySelectorAll('button, a[href]')]
      const first = all[0], last = all[all.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', key)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', key); menu.current?.focus() }
  }, [navOpen, mobile])

  useEffect(() => {
    let frame
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        if (progressBar.current) progressBar.current.style.width = `${max > 0 ? Math.min(100, window.scrollY / max * 100) : 0}%`
      })
    }
    window.addEventListener('scroll', update, { passive: true }); update()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update) }
  }, [])

  useEffect(() => {
    let frame
    const position = () => {
      const target = section ? document.getElementById(section) : chapter ? document.getElementById(chapter.id) : main.current
      if (!target || main.current.querySelector('[data-loading]')) return false
      frame = requestAnimationFrame(() => {
        if (section || chapter) target.scrollIntoView({ behavior: 'instant', block: 'start' })
        else window.scrollTo({ top: 0, behavior: 'instant' })
        main.current.focus({ preventScroll: true })
      })
      return true
    }
    const observer = new MutationObserver(() => { if (position()) observer.disconnect() })
    if (!position()) observer.observe(main.current, { childList: true, subtree: true })
    return () => { cancelAnimationFrame(frame); observer.disconnect() }
  }, [path, section, chapter])

  const stats = useMemo(() => {
    let total = 0, done = 0
    for (const ch of [...CHAPTERS, ...LABS.map((lab) => ({ ...lab, id: lab.qid }))]) {
      const set = new Set(checks[ch.id] || [])
      total += ch.quests.length; done += ch.quests.filter((_, i) => set.has(i)).length
    }
    return { total, done, lv: Math.min(10, Math.floor(done / Math.max(1, total / 10)) + (done ? 1 : 0)), pct: total ? done / total * 100 : 0 }
  }, [checks])

  const closeNav = () => setNavOpen(false)
  const Page = EXTRAS[view]
  return <>
    <a className="skip-link" href="#main-content" onClick={(e) => { e.preventDefault(); main.current.focus(); main.current.scrollIntoView({ behavior: 'instant' }) }}>跳至正文</a>
    <div className="progress-track" aria-hidden="true"><div ref={progressBar} className="progress-fill" /></div>
    <button ref={menu} className="nav-toggle" aria-label={navOpen ? '关闭目录' : '打开目录'} aria-expanded={navOpen} aria-controls="site-sidebar" onClick={() => setNavOpen((v) => !v)}><PixelIcon name="menu" size={20} /></button>
    {mobile && navOpen && <button className="nav-backdrop" tabIndex={-1} aria-label="关闭目录遮罩" onClick={closeNav} />}
    <aside id="site-sidebar" ref={sidebar} className={`sidebar ${navOpen ? 'open' : ''}`} inert={mobile && !navOpen} aria-label="手册目录">
      {mobile && navOpen && <button className="sidebar-close" onClick={closeNav}>关闭目录 ✕</button>}
      <div className="sidebar-head"><div className="logo-row"><div className="logo-bot"><RobotSprite /></div><div><a href="#home" onClick={closeNav} className="logo-title">AGENT 开发全指南</a><div className="logo-sub">FROM ZERO TO AGENT MASTER</div></div></div></div>
      <div className="lv-box"><div className="lv-line"><span className="lv-num">LV.{stats.lv}</span><span className="lv-name">学习进度 · 非职业认证</span></div><div className="exp-track"><div className="exp-fill" style={{ width: `${stats.pct}%` }} /></div><div className="exp-hint" role="status">EXP {stats.done}/{stats.total} · 勾选清单记录学习进度</div></div>
      <nav className="toc" aria-label="章节和支线"><div className="toc-label">— 主线攻略 —</div>
        {CHAPTERS.map((ch) => <a key={ch.id} href={`#${ch.id}`} className={`toc-item ${path === ch.id ? 'active' : ''}`} aria-current={path === ch.id ? 'page' : undefined} onClick={closeNav}><span className="toc-num">{ch.num}</span><span className="toc-ico"><PixelIcon name={CH_ICON[ch.id]} /></span><span>{ch.title}</span>{ch.quests.every((_, i) => (checks[ch.id] || []).includes(i)) && <span className="toc-check">✔</span>}</a>)}
        <div className="toc-label">— 支线副本 —</div>{EXTRA_DEFS.map((e) => <a key={e.key} href={`#${e.key}`} onClick={closeNav} className={`toc-item special ${view === e.key ? 'active' : ''}`} aria-current={view === e.key ? 'page' : undefined}><span className="toc-num">{e.sub}</span><span className="toc-ico"><PixelIcon name={EXTRA_ICON[e.key]} /></span><span>{e.label}</span></a>)}
      </nav><div className="sidebar-foot"><a href="#versions" onClick={closeNav} style={{ color: 'inherit', textDecoration: 'none' }}>版本 v{versionData.version} · 文档管理中心 →</a><br />论文 {resourceSummary.papers} 篇 · 项目 {resourceSummary.projects} 个 · 实战 {LABS.length} 个</div>
    </aside>
    <main id="main-content" ref={main} className="main" tabIndex={-1} inert={mobile && navOpen}>
      <p className="storage-status" role="status">{storageMessage}</p>
      <Suspense fallback={<div data-loading>{loading}</div>}>
        {view === 'home' && <HomeView goChapter={(id) => navigate(id)} />}
        {chapter && <ChapterReader key={chapter.id} ch={chapter} />}
        {view === 'read' && <><h1 className="page">全文阅读</h1>{CHAPTERS.map((ch) => <ChapterReader key={ch.id} ch={ch} />)}</>}
        {view === 'lab' && <LabsPage />}{view === 'papers' && <PapersPage />}{view === 'projects' && <ProjectsPage />}{Page && <Page />}
        {!chapter && !['home', 'read', 'lab', 'papers', 'projects', 'roadmap', 'glossary', 'versions'].includes(view) && <div className="page"><h1>没有找到这一页</h1><a href="#home">返回首页</a></div>}
      </Suspense>
      <footer className="foot"><div className="foot-inner"><div><b>AGENT 开发全指南</b> — 从概念到实现与验证 · <a href="#versions">v{versionData.version} 版本演进与日志</a></div><div>内容核查快照：{versionData.snapshotDate}。遵循 SemVer 2.0.0 规范，开源协议 MIT。</div></div></footer>
    </main>
  </>
}

function ChapterReader({ ch }) {
  const ref = useRef(null)
  const [headings, setHeadings] = useState([])
  const [status, setStatus] = useState('')
  const index = CHAPTERS.findIndex((item) => item.id === ch.id)
  const Comp = ch.Comp
  useEffect(() => {
    const list = [...ref.current.querySelectorAll('h3, h4')].map((h, i) => { h.id = `${ch.id}-section-${i + 1}`; return { id: h.id, text: h.textContent } })
    setHeadings(list)
  }, [ch.id])
  const share = async () => { const ok = await copyText(window.location.href); setStatus(ok ? '链接已复制' : '复制失败，请复制浏览器地址栏中的链接。') }
  return <section ref={ref} id={ch.id} data-ch={ch.id} className="chapter">
    <h1 className="sr-only">{ch.num} {ch.title}</h1>
    <nav className="chapter-nav" aria-label={`${ch.num} 章节导航`}><a href="#home">章节首页</a>{index > 0 && <a href={`#${CHAPTERS[index - 1].id}`}>← 上一章</a>}{index < CHAPTERS.length - 1 && <a href={`#${CHAPTERS[index + 1].id}`}>下一章 →</a>}<button onClick={share}>分享当前链接</button><span role="status">{status}</span></nav>
    <details className="section-toc"><summary>本章目录</summary><nav aria-label={`${ch.num} 小节目录`}>{headings.map((h) => <a key={h.id} href={`#${ch.id}?section=${h.id}`}>{h.text}</a>)}</nav></details>
    <Comp />
    <nav className="chapter-nav" aria-label={`${ch.num} 读完后导航`}>{index > 0 && <a href={`#${CHAPTERS[index - 1].id}`}>← 上一章</a>}{index < CHAPTERS.length - 1 && <a href={`#${CHAPTERS[index + 1].id}`}>下一章 →</a>}<a href="#home">返回目录</a></nav>
  </section>
}

function HomeView({ goChapter }) {
  return (
    <>
      <header className="hero hero-crt">
        <a href="#versions" className="hero-tag" style={{ textDecoration: 'none', cursor: 'pointer' }}>◆ VERSION {versionData.version} · 核查快照 {versionData.snapshotDate} · 版本与演进中心 →</a>
        <h1>AGENT 开发工程师<br /><span className="hl">全指南</span></h1>
        <p className="lead">
          一本<strong style={{ color: 'var(--gold)' }}>像素风互动手册</strong>,从「什么是 Agent」一路打到「多智能体架构、协议生态与前沿方向」。
          知识点全部对照 2025-2026 一线大厂公开实践(Anthropic / OpenAI / Google / 微软)与经典论文整理,
          配备流程图、可运行的循环演示、通关清单、论文军火库与 GitHub 兵器谱——
          <b style={{ color: 'var(--term-cyan)' }}>从概念理解到独立实现与评测，逐步积累工程能力。</b>
        </p>
        <button className="px-btn" style={{ marginTop: 20 }} onClick={() => goChapter('ch01')}>▶ 按下 START,开始冒险</button>
        <a className="hero-lab-link" href="#lab">实战工坊 →</a>
        <div className="hero-stats">
          <div className="hero-stat"><b>{CHAPTERS.length}</b><span>主线章节</span></div>
          <div className="hero-stat"><b>{resourceSummary.diagrams}</b><span>原创图解</span></div>
          <div className="hero-stat"><b>{LABS.length}</b><span>实战教学项目</span></div>
          <div className="hero-stat"><b>{resourceSummary.papers}</b><span>归类论文</span></div>
          <div className="hero-stat"><b>{resourceSummary.projects}</b><span>高星项目</span></div>
          <div className="hero-stat"><b>∞</b><span>搞 Agent 的热情</span></div>
        </div>

        <div className="hero-deco"><RobotSprite big /></div>
      </header>

      <div className="page" style={{ paddingTop: 40, paddingBottom: 0 }}>
        <div className="card gold" style={{ marginTop: 30 }}>
          <span className="card-tag">如何使用本手册</span>
          <ul style={{ margin: '4px 0 0' }}>
            <li>左侧是<strong>主线攻略顺序</strong>,由浅入深;完全零基础请按顺序推进,有经验的玩家可直接空降章节。</li>
            <li>想动手?<strong>「实战工坊」</strong>有三个教学项目(客服 Agent / 深度研究 / 代码审查)，提供关键代码、架构决策与评测设计。补齐集成后验证，简历只写自己完成并测得的结果。</li>
            <li>每章末尾有<strong>「通关清单」</strong>——勾选后侧边栏 LV 会涨经验(实战项目同样计分),集齐全部徽章成为满级 Agent 大师。</li>
            <li>看到 <span className="tag a">实战</span> <span className="tag g">洞察</span> <span className="tag p">避坑</span> 标签的卡片,是浓缩的实战经验,值得背下来。</li>
            <li>外部资料链接指向原文；论文 PDF 本地提供。项目 Star 与更新时间是 GitHub API 采集快照，归档项目另标历史参考。</li>
          </ul>
        </div>
      </div>

      <div className="page chapter-index"><h2>选择章节</h2><p>按章阅读保留进度，也可<a href="#read">进入全文模式</a>。</p>
        {CHAPTERS.map((ch) => <a key={ch.id} href={`#${ch.id}`} className="chapter-card"><b>{ch.num} <PixelIcon name={CH_ICON[ch.id]} size={13} /> {ch.title}</b><span>约 {ch.mins} 分钟 <PixelIcon name="play" size={10} /></span></a>)}
      </div>
    </>
  )
}
