// 论文原图卡片:按章节自动注入对应「原著图」(来源:ar5iv / arXiv 官方 HTML / 官方仓库)
import data from '../data/paper-figures.json'

export function PaperFigures({ chapter }) {
  const figs = data.figures.filter((f) => f.ok && f.chapter === chapter)
  if (!figs.length) return null
  return (
    <>
      {figs.map((f) => (
        <figure className="paper-fig" key={f.arxivId + '#' + f.figN}>
          <div className="paper-fig-head">
            <span className="paper-fig-badge">PAPER FIGURE · 原著图</span>
            <a className="paper-fig-link" href={`https://arxiv.org/abs/${f.arxivId}`} target="_blank" rel="noreferrer">
              arXiv:{f.arxivId}
            </a>
          </div>
          <div className="paper-fig-media">
            <img src={f.file} alt={`${f.sourceLabel} — ${f.captionEn}`} loading="lazy" />
          </div>
          <figcaption className="paper-fig-cap">
            <div className="paper-fig-note">📖 {f.note}</div>
            <div className="paper-fig-src">
              来源:{f.sourceLabel}
              {f.figN ? ` · Figure ${f.figN}` : ''} · 原文图注:{f.captionEn}
            </div>
          </figcaption>
        </figure>
      ))}
    </>
  )
}
