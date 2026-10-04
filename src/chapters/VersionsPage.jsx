import versionData from '../data/version.json'
import PixelIcon from '../components/PixelIcon.jsx'
import CodeBlock from '../components/CodeBlock.jsx'

export default function VersionsPage() {
  const { version, releaseDate, codename, semverPolicy, releases, stats, contributionTypes } = versionData

  return (
    <div className="page">
      <div className="ch-head">
        <div className="ch-meta">
          <span className="ch-level">SPEC · DOCS</span>
          <span className="ch-mins">持续更新 · 遵循 SemVer 2.0.0</span>
        </div>
        <h1 className="ch-title">版本与文档管理中心</h1>
        <div className="ch-en">VERSION MANAGEMENT, CHANGELOG & CONTRIBUTING SPECIFICATION</div>
      </div>

      <div className="card boss" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="tag b" style={{ fontSize: 13, padding: '4px 10px' }}>CURRENT STABLE</span>
            <span style={{ fontSize: 26, fontWeight: 700, marginLeft: 10, color: 'var(--term-cyan)', fontFamily: 'var(--font-pixel)' }}>
              {version}
            </span>
            <span style={{ fontSize: 14, marginLeft: 12, opacity: 0.8 }}>代号:「{codename}」</span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            发布日期：{releaseDate} · 开源协议：MIT
          </div>
        </div>
        <p style={{ marginTop: 14, lineHeight: 1.8, fontSize: 14.5 }}>
          本手册为工业级开源项目设计，设立专门的文档与版本管理规范。所有主线章节、实战工坊、论文库与兵器谱均采用结构化数据驱动，
          每次重大改进、内容勘误或功能升级均记录版本变更与审计日志，确保开源社区长期协作清晰、可溯源、可防御。
        </p>
      </div>

      <div className="hero-stats" style={{ margin: '24px 0 32px' }}>
        <div className="hero-stat"><b>{stats.chapters}</b><span>主线章节</span></div>
        <div className="hero-stat"><b>{stats.labs}</b><span>实战工坊</span></div>
        <div className="hero-stat"><b>{stats.papers}</b><span>收录论文</span></div>
        <div className="hero-stat"><b>{stats.projects}</b><span>开源兵器</span></div>
        <div className="hero-stat"><b>{stats.diagrams}</b><span>原创图解</span></div>
        <div className="hero-stat"><b>{stats.codeFiles}</b><span>生产级源码</span></div>
      </div>

      <div className="card gold">
        <span className="card-tag">📜 版本号命名与迭代公约</span>
        <p style={{ margin: '6px 0 0', lineHeight: 1.8 }}>
          <strong>语义化版本规则（Semantic Versioning）：</strong><br />
          {semverPolicy}
        </p>
      </div>

      <h2 style={{ marginTop: 42, marginBottom: 18 }}>📅 版本演进时间轴（Changelog）</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {releases.map((rel) => (
          <div className="card" key={rel.version} style={{ borderLeft: rel.tag === 'LATEST' ? '6px solid var(--accent)' : '4px solid var(--ink)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-pixel)', color: 'var(--ink)' }}>
                  {rel.version}
                </span>
                <span className={`tag ${rel.tag === 'LATEST' ? 'a' : rel.tag === 'STABLE' ? 'b' : 'p'}`}>
                  {rel.tag}
                </span>
                <b style={{ fontSize: 16 }}>{rel.title}</b>
              </div>
              <span style={{ fontSize: 13, color: 'var(--ink-faint)' }}>{rel.date}</span>
            </div>

            <p style={{ margin: '6px 0 14px', fontSize: 14, color: 'var(--ink)' }}>
              {rel.summary}
            </p>

            <div style={{ background: 'var(--paper-2)', padding: '12px 16px', border: '1px solid rgba(0,0,0,0.08)' }}>
              <b style={{ fontSize: 13, display: 'block', marginBottom: 8, color: 'var(--ink)' }}>变更记录 (Highlights):</b>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.8 }}>
                {rel.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 48, marginBottom: 18 }}>🛠️ 开源贡献与文档维护指引</h2>
      <p>
        本手册欢迎开源社区开发者共同建设。为了保证文档质量与学术/工程严谨度，所有 PR 请对照以下模块结构提交：
      </p>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>贡献类型</th>
              <th style={{ width: '25%' }}>目标文件路径</th>
              <th style={{ width: '25%' }}>便捷维护命令</th>
              <th>审核标准与说明</th>
            </tr>
          </thead>
          <tbody>
            {contributionTypes.map((c, i) => (
              <tr key={i}>
                <td><b>{c.type}</b></td>
                <td><code style={{ fontSize: 12 }}>{c.location}</code></td>
                <td><code style={{ fontSize: 12, color: 'var(--blue)' }}>{c.cli}</code></td>
                <td>{c.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card idea" style={{ marginTop: 24 }}>
        <span className="card-tag">🚀 极速本地发版与验证流水线</span>
        <p style={{ margin: 0 }}>
          当你在本地修改了内容或准备发布新版本时，建议运行以下命令完成质量审计与构建验证：
        </p>
        <CodeBlock
          name="RELEASE_WORKFLOW.SH"
          code={`# 1. 运行全量数据校验与引用差集检查
node tools/check-data.mjs
node tools/audit-cited-diff.mjs

# 2. 运行 14 项完整性终检
node tools/final-check.mjs

# 3. 生产打包并测试构建结果
npm run build
npm run preview`}
          kind="开发脚本"
        />
      </div>
    </div>
  )
}
