import { FigLabMap } from './diag.jsx'
import { Kpis, CodeFile } from './labbits.jsx'
import { LABS } from './registry.js'

/* 工坊大厅:实战模块总览 */
export default function Overview({ onGo }) {
  return (
    <>
      <div className="card gold">
        <span className="card-tag">🛠 实战工坊 · 使用说明书</span>
        <ul style={{ margin: '4px 0 0' }}>
          <li><b>这里是三个面向企业场景的教学项目。</b>每个项目都有需求分析、架构决策、关键代码、评测方案与上线清单；运行时需补齐文件结构、依赖及集成实现——按里程碑顺序推进,每一行代码都建议亲手敲一遍再跑通。</li>
          <li>代码全部基于 <b>2025-2026 一线公开工程实践</b>整理(Anthropic / OpenAI 工程博客、主流商用 Agent 产品的公开分享),展示错误处理、幂等、评测与成本控制；这些是工程模式，不代表仓库已有生产部署或目标 KPI 的实测证据。</li>
          <li>主线章节教「为什么」,实战工坊练「怎么做」。建议边打边回翻对应章节(每个项目都标了关联章节)。</li>
          <li>打完一个项目,末尾有<b>「简历可以这么写」</b>和面试深挖题——直接闭环到求职。</li>
        </ul>
      </div>

      <details className="example-setup"><summary>运行前：环境、依赖与验证入口</summary>
        <p>Python 3.12+；示例为需要集成的核心文件，尚未打包为独立部署工程。按文件名建立 atlas/scout/sentinel 包，补齐缺省模块与项目配置，先用 Mock 跑通，再接真实服务。部署前固定本地验证过的依赖版本并记录模型快照。</p>
        <CodeFile name="环境与运行命令" kind="集成步骤" code={`python -m venv .venv
# 激活虚拟环境后安装并生成自己的锁定记录
python -m pip install openai pydantic pydantic-settings fastapi uvicorn psycopg[binary,pool] pgvector PyJWT[crypto]==2.15.1 PyYAML httpx pytest
python -m pip freeze > requirements.lock.txt
# ATLAS：先执行数据库迁移、配置可信 IdP，认证后创建自己的会话
python -m uvicorn atlas.api:app --host 127.0.0.1 --port 8000
# SCOUT：先配置搜索 provider 与 mock 测试
python -m scout.run "你的研究问题"
# SENTINEL：先完成离线回放，再用测试仓库验证 webhook
python -m uvicorn sentinel.api:app --host 127.0.0.1 --port 8001
# 本手册实际离线检查入口（不调用第三方服务）
node tools/check-examples.mjs
node tools/test-reviewed-fixes.mjs`} />
        <p>必填配置：对应项目 API key、模型价目、数据库/搜索凭据；ATLAS 还需 JWKS/issuer/audience；SENTINEL 需最小权限 GitHub 凭据与 webhook 密钥、持久任务目录。预期结果：授权会话可用、跨用户访问拒绝、SCOUT 未核验引用保留标记、失败任务可重试、API 错误不记发布成功。</p>
        <p>预算是调用前检查的任务软阈值，单次收费调用及并发仍可超出；会话累计预算、严格预留与第三方工具费用须另集成持久账本。样例 KPI、业务规模和时延均为教学假设。</p>
      </details>
      <FigLabMap />

      <h2>三个项目,怎么选?</h2>
      <div className="grid3">
        {LABS.map((lab) => (
          <div className="card" key={lab.key}>
            <span className="card-tag">{lab.code}</span>
            <p style={{ margin: '6px 0 2px', fontWeight: 700 }}>{lab.icon} {lab.title}</p>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>{lab.brief}</p>
            <p style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>难度 {lab.level} · {lab.weeks} · {lab.scene}</p>
            <button className="px-btn" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => onGo(lab.key)}>▶ 进入项目</button>
          </div>
        ))}
      </div>
      <div className="card idea">
        <span className="card-tag">🧭 推荐打通顺序</span>
        <p style={{ margin: '4px 0 0' }}>
          <b>ATLAS → SCOUT → SENTINEL</b>。ATLAS 用最朴素的单循环打地基(路由/检索/护栏/评测全都在一个进程里,看得见摸得着);
          SCOUT 升级到多智能体编排(异步、预算、引用溯源);SENTINEL 最贴近真实工程集成(webhook、幂等、增量、回放评测)。
          零基础玩家请先过掉主线 CH.01-CH.05 再进场;SCOUT 建议先读 CH.11/12;SENTINEL 建议先读 CH.14-16。
        </p>
      </div>

      <h2>三个项目共享的工程约定</h2>
      <p>企业里真实团队不会每个项目从零发明轮子——他们沉淀一套「基础设施层」然后复用。这里也一样:三个项目共享同一套约定,你在 ATLAS 里写好的 <code style={{ fontFamily: 'var(--font-mono)' }}>llm.py</code>、配置管理、trace 记录,SCOUT 和 SENTINEL 直接继承。这本身就是第一课:<b>可恢复、可观测、可测试的软件工程是 Agent 落地的重要基础。</b></p>
      <Kpis label="共享配置约定" items={[
        ['Python 3.12+', '示例使用的统一语言'],
        ['Pydantic v2', '所有 LLM 结构化输出都过校验'],
        ['OpenAI Responses API', '本例使用 Responses；切换供应商需逐项适配'],
        ['pytest + 回放集', '评测即测试,进 CI 才算数'],
        ['JSONL trace', '每步耗时/token/成本落盘,可复盘'],
        ['任务软阈值', '网关统一计量；严格限额须预留并持久计账'],
      ]} />
      <div className="card tip">
        <span className="card-tag">🎒 开工前的环境清单</span>
        <ul style={{ margin: '4px 0 0' }}>
          <li>当前示例使用 OpenAI Responses API：lite=gpt-6-luna、main=gpt-6.1-sol、reasoning=low。通过项目环境变量填写 key；其他厂商需原生/兼容适配器，不只改 base_url。ATLAS 的嵌入模型、端点、维度与价格单独配置。</li>
          <li>ATLAS 需要一个 Postgres 16+(启用 pgvector 扩展);SCOUT / SENTINEL 用 SQLite 即可零负担起步。</li>
          <li>先用小语料与离线 mock 验证逻辑，再配置单次输出、轮数与总费用上限；运行费用取决于模型、缓存和调用量，不能承诺固定人民币预算。<b>先跑通,再加料。</b></li>
          <li>推荐用 <code style={{ fontFamily: 'var(--font-mono)' }}>uv venv</code> 或 <code style={{ fontFamily: 'var(--font-mono)' }}>python -m venv</code> 给每个项目独立虚拟环境。</li>
        </ul>
      </div>
      <div className="card boss">
        <span className="card-tag">BOSS 提示</span>
        <p style={{ margin: 0 }}>
          实战和看书的最大区别:<b>真实系统会在 3AM 挂掉。</b>所以每个项目我们都会花一整章的篇幅讲「上线之后」——评测回归、成本护栏、降级预案。
          跟做时请不要跳过这些「无聊的部分」,它们恰恰是面试官区分「跑过 demo 的」和「上过生产的」的分水岭。
        </p>
      </div>
    </>
  )
}
