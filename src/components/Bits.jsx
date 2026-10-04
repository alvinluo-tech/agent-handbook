import { useEffect, useRef, useState } from 'react'
import { useChecks, toggleQuest } from '../lib/progress.js'
import { PaperFigures } from './PaperFigures.jsx'
import PixelIcon, { CH_ICON } from './PixelIcon.jsx'

/* ---------- 章节头 ---------- */
export function ChapterHead({ num, id, icon, title, en, mins }) {
  return (
    <div className="ch-head">
      <div className="ch-meta">
        <span className="ch-level">{num}</span>
        <span className="ch-mins">约 {mins} 分钟 · <PixelIcon name={CH_ICON[id]} size={14} /></span>
      </div>
      <h2 className="ch-title">{title}</h2>
      <div className="ch-en">{en}</div>
    </div>
  )
}

/* ---------- 通关清单(存 localStorage,驱动 LV/EXP) ---------- */
export function QuestList({ id, items }) {
  const checks = useChecks()
  const done = new Set((checks[id] || []).filter((i) => i < items.length))
  const toggle = (i) => toggleQuest(id, i)
  return (
    <div className="quest">
      <div className="quest-head">
        <span>◆ 本章通关清单</span>
        <span className="quest-count">{done.size}/{items.length} DONE</span>
      </div>
      <ul className="quest-list">
        {items.map((t, i) => (
          <li key={i}>
            <label className={`quest-item ${done.has(i) ? 'done' : ''}`}>
              <input type="checkbox" className="sr-only" checked={done.has(i)} onChange={() => toggle(i)} />
              <span className="box" aria-hidden="true">{done.has(i) ? '✔' : ''}</span>
              <span>{t}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- 通用章节骨架 ---------- */
export function Chapter({ ch, children }) {
  return (
    <>
      <ChapterHead {...ch} />
      <PaperFigures chapter={ch.id} />
      {children}
      <QuestList id={ch.id} items={ch.quests} />
    </>
  )
}

/* ---------- Agent 循环交互演示终端 ---------- */
const SCRIPT = [
  { cls: 'in', text: 'user > 我们下月要办 Agent 技术分享会,帮我看看仓库 agent-guide 还有多少 open issue,顺便给 issues 打上 "meetup" 标签。' },
  { cls: 'dim', text: '[LOOP 1 · 感知] 读取用户目标 + 当前上下文…' },
  { cls: 'out', text: 'thought > 目标有两个:①统计 open issue 数 ②打标签。我需要先调用 GitHub 工具列出 issues。' },
  { cls: 'tool', text: 'action > call list_issues(repo="org/agent-guide", state="open")' },
  { cls: 'dim', text: '[环境执行] GitHub API 返回 → 42 条记录(用时 380ms)' },
  { cls: 'out', text: 'observation > open issues = 42。接下来给它们打标签。' },
  { cls: 'tool', text: 'action > call add_label(repo="org/agent-guide", issue="all", label="meetup")' },
  { cls: 'err', text: 'observation > ✗ 权限不足:批量写操作需要人工确认(权限策略:write:batch)' },
  { cls: 'out', text: 'thought > 写操作被 human-in-the-loop 拦截。我应该请求用户授权,而不是反复重试。' },
  { cls: 'tool', text: 'action > ask_human("将为 42 个 open issue 添加标签 meetup,确认执行?")' },
  { cls: 'in', text: 'user > 确认,执行吧。' },
  { cls: 'tool', text: 'action > call add_label(...) → 42/42 成功' },
  { cls: 'dim', text: '[LOOP 2 · 反思] 子目标全部完成,可以终止循环。' },
  { cls: 'out', text: 'final > 仓库共有 42 个 open issue,已全部打上 "meetup" 标签 ✔(中途经历 1 次权限拦截,经你确认后完成)。' },
]

export function LoopDemo() {
  const [n, setN] = useState(0)
  const timer = useRef(null)
  const [running, setRunning] = useState(false)
  const pause = () => { clearInterval(timer.current); timer.current = null; setRunning(false) }
  const play = () => {
    if (timer.current) return
    setRunning(true)
    timer.current = setInterval(() => {
      setN((v) => {
        if (v >= SCRIPT.length) { clearInterval(timer.current); timer.current = null; setRunning(false); return v }
        return v + 1
      })
    }, 900)
  }
  useEffect(() => () => clearInterval(timer.current), [])
  const reset = () => { pause(); setN(0) }
  return (
    <div className="term">
      <div className="term-bar">
        <span style={{ color: '#f27e7e' }}>●</span>
        <span style={{ color: '#f2d87e' }}>●</span>
        <span style={{ color: '#7ef29d' }}>●</span>
        <span style={{ marginLeft: 8 }}>AGENT_LOOP.SIM — {n >= SCRIPT.length ? 'COMPLETE' : running ? 'RUNNING' : n ? 'PAUSED' : 'READY'}</span>
      </div>
      <div className="term-body" role="log" aria-label="Agent 循环演示输出">
        {SCRIPT.slice(0, n).map((s, i) => (
          <div key={i} className={s.cls}>{s.text}</div>
        ))}
        {n < SCRIPT.length && <div className="dim">▌</div>}
      </div>
      <div style={{ padding: '0 18px 14px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button className="px-btn" style={{ fontSize: 12, padding: '6px 14px' }} onClick={play} disabled={n >= SCRIPT.length || running}><PixelIcon name="play" size={11} /> 自动运行</button>
        <button className="px-btn blue" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => { pause(); setN((v) => Math.min(SCRIPT.length, v + 1)) }}><PixelIcon name="step" size={11} /> 单步</button>
        <button className="px-btn ghost" onClick={pause} disabled={!running}><PixelIcon name="pause" size={11} /> 暂停</button>
        <button className="px-btn ghost" style={{ fontSize: 12, padding: '6px 14px' }} onClick={reset}><PixelIcon name="reset" size={11} /> 重置</button>
      </div>
    </div>
  )
}

/* ---------- 手风琴(FAQ 用) ---------- */
export function Acc({ q, children }) {
  return <details className="faq"><summary>{q}</summary><p>{children}</p></details>
}
