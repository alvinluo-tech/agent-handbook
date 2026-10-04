import { useId, useRef, useState } from 'react'

export default function Figure({ no, cap, vb, children }) {
  const id = useId()
  const figure = useRef(null)
  const [message, setMessage] = useState('')
  const [expanded, setExpanded] = useState(false)
  const exportSvg = () => {
    const svg = figure.current.querySelector('svg').cloneNode(true)
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }))
    const link = document.createElement('a')
    link.href = url; link.download = `${no.replace(/[^a-z0-9-]/gi, '-') || 'diagram'}.svg`; link.click()
    URL.revokeObjectURL(url)
  }
  const fullscreen = async () => {
    try {
      if (figure.current.requestFullscreen) await figure.current.requestFullscreen()
      else { setExpanded((v) => !v); setMessage('已展开图解，可横向滚动；再次按展开恢复。') }
    } catch { setExpanded((v) => !v); setMessage('已展开图解，可横向滚动；再次按展开恢复。') }
  }
  return <figure ref={figure} className={`figure ${expanded ? 'figure-expanded' : ''}`}>
    <div className="figure-actions"><button onClick={fullscreen}>展开图解</button><button onClick={exportSvg}>下载 SVG</button></div>
    <div className="figure-scroll" tabIndex={0} role="region" aria-label={`${no} 图解，窄屏可左右滚动`}>
      <svg viewBox={vb} shapeRendering="crispEdges" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
        <title id={`${id}-title`}>{no} 图解</title><desc id={`${id}-description`}>{cap}</desc>{children}
      </svg>
    </div>
    <figcaption className="figcap"><span className="fig-no">{no}</span><span>{cap}</span></figcaption>
    <p className="figure-help">窄屏可左右滚动查看；文字说明见图注与相邻正文。</p><span role="status">{message}</span>
  </figure>
}
