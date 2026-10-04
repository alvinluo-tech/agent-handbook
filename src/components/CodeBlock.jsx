import { useRef, useState } from 'react'
import { copyText } from '../lib/clipboard.js'

export default function CodeBlock({ name = '教学代码', code, note, kind = '核心片段' }) {
  const pre = useRef(null)
  const [status, setStatus] = useState('')
  const copy = async () => {
    const ok = await copyText(pre.current?.textContent || code)
    if (ok) {
      setStatus('已复制')
    } else {
      setStatus('复制失败，请在代码区手动选择并复制。')
      pre.current?.focus()
    }
  }
  return <div className="code">
    <div className="code-bar"><span className="code-name">{name}</span>
      <button className="copy-btn" onClick={copy} aria-label={`复制 ${name}`}>⧉ 复制</button></div>
    <div className="example-context">{kind} · 按项目文件结构补齐依赖、配置与缺省模块；环境与运行入口见本章或项目说明。语法检查不等于集成验证。</div>
    <pre ref={pre} tabIndex={0} aria-label={`${name} 代码`}>{code}</pre>
    <div className="copy-status" role="status">{status}</div>
    {note && <div className="code-note">※ {note}</div>}
  </div>
}
