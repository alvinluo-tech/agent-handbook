import { LabHead, Mile, CodeFile, FileTree, Kpis, Adr, LabToc } from './labbits.jsx'
import { FigScoutArch } from './diag.jsx'
import { LABS } from './registry.js'

const lab = LABS[1]

export default function P2a() {
  return (
    <>
      <LabHead
        lab={lab}
        scene={'投研分析师/战略咨询的日常:接到一个研究问题(如「2026 年东南亚移动支付的主要玩家与监管态势」),需要一份带出处的简报。人工做法是几十次搜索 + 几小时整理;SCOUT 演示如何把它变成可审计的研究委托，时长需实测——这正是 OpenAI Deep Research、Anthropic 多代理研究系统验证过的场景。'}
        stack={'Python 3.12 · asyncio(信号量并发)· OpenAI 兼容 SDK · Tavily/Bing 搜索(可换)· SQLite(缓存)· trafilatura(正文提取)'}
        resume={'「实现多智能体深度研究系统:orchestrator-worker 编排、token 预算制、引用台账与交叉校验,在 [样本/模型快照] 上测得来源可访问率 [实测值]、人工核验的引用支持率 [实测值]、单份成本 [实测值]」——数字与样本须有证据。'}
        points={'多智能体编排的全部实战细节:任务拆解、预算分配、上下文隔离、压缩回传、引用溯源、交叉校验。打完这关,CH.12 的每一句话你都有了代码坐标。'}
      />
      <LabToc items={[
        { id: 'p2-m0', no: 'M0', label: '需求与质量标准' },
        { id: 'p2-m1', no: 'M1', label: '架构与决策' },
        { id: 'p2-m2', no: 'M2', label: 'Schema 与预算' },
        { id: 'p2-m3', no: 'M3', label: 'Lead:拆解与计划' },
        { id: 'p2-m4', no: 'M4', label: 'Worker:并行子代理' },
        { id: 'p2-m5', no: 'M5', label: '台账与写作' },
        { id: 'p2-m6', no: 'M6', label: '评测与成本' },
        { id: 'p2-res', no: 'END', label: '简历与面试' },
      ]} />

      <Mile id="p2-m0" no="M0" title="需求分析:报告的质量标准必须先于报告存在">
        <p>Deep Research 类产品的失败从来不是「没生成出报告」,而是生成了<b>看起来专业、实则注水</b>的报告。所以 M0 的核心是把「好报告」拆成可判定的标准——它们将在 M6 直接变成 rubric 评测的评分项。</p>
        <Kpis items={[
          ['100%', '计划覆盖率:研究计划里每个子问题在报告中都有对应章节'],
          ['分别验收', '来源可访问率与引用支持率：后者需要原文核对和人工校准'],
          ['0', '幻觉引用:引用了不存在的页面或编造的摘录——一票否决项'],
          ['≥ 8/10', 'rubric 加权分:覆盖度/溯源/平衡性/诚实性四维 judge 评分'],
          ['≤ $3', '单份报告成本(小模型档 ≤ $1):预算是本项目的第一设计约束'],
          ['≤ 8 min', '端到端时长验收目标；并行收益须与同任务串行基线实测比较'],
        ]} />
        <div className="card warn">
          <span className="card-tag">⚠ 非目标</span>
          <ul style={{ margin: '4px 0 0' }}>
            <li><b>不是聊天机器人</b>——SCOUT 的交互只有一个入口(研究问题)和一个出口(报告),对话仅用于前置澄清。</li>
            <li><b>不做投资建议</b>——报告末尾固定输出免责声明;这既是合规要求,也是对「模型输出被当真」风险的基本尊重。</li>
            <li><b>不追求全知</b>——查证不清的问题进 <code style={{ fontFamily: 'var(--font-mono)' }}>open_questions</code> 而不是被掩盖。「承认边界」是这个产品的核心卖点,不是缺陷。</li>
          </ul>
        </div>
        <div className="card idea">
          <span className="card-tag">💡 为什么深度研究是学多智能体的最佳场景</span>
          <p style={{ margin: 0 }}>因为任务天然<b>可拆分、可并行、可验证</b>:子问题之间独立性清楚,谁干的好坏一目了然(有引用),预算也好计量(token)。Anthropic 工程博客正是用这个场景讲解 orchestrator-worker 的:拆解质量决定报告质量,预算分配决定成本曲线——你在别的场景里要多走很多弯路才能看清这两条。</p>
        </div>
      </Mile>

      <Mile id="p2-m1" no="M1" title="架构与决策:orchestrator-worker 的并发与预算">
        <FigScoutArch />
        <p><a href="https://www.anthropic.com/engineering/multi-agent-research-system" target="_blank" rel="noreferrer">Anthropic 2025 年研究系统报告</a>：多 Agent 约耗普通聊天 15 倍 token，单 Agent 约 4 倍；其 Opus 4 Lead + Sonnet 4 Workers 在内部研究评测上，比单 Opus 4 的结果提升 90.2%。成本和质量数字的基线不同，不能当 SCOUT 的实测值或普遍收益。下面通过预算与固定评测集判断本项目是否值得并行：</p>
        <Adr rows={[
          ['orchestrator-worker 拓扑,3-5 个并发 worker', '单 agent 串行搜索(上下文越来越脏)或全连接多代理(失控)', '研究任务天然可拆并行;每个 worker 独立上下文,互不污染——上下文隔离是多代理最被低估的价值', '并发调用的费用可能增加 → 预算 + 努力档 + 缓存，并比较同任务单 Agent 基线'],
          ['worker 只回压缩结论(findings + 摘录)', 'worker 回传抓取的网页全文', '主线程上下文是全局最稀缺资源:全文回流 = 两个 worker 就爆窗,且主线程被脏上下文拖到降智', '压缩有信息损失 → findings 强制保留原文 quote,可溯源可验证'],
          ['先澄清(≤2 问)再开工', '拿到问题直接开搜', '问题歧义(时间范围/地域/口径)是报告返工的第一大原因,澄清一次的成本 << 重跑一次', '多一轮交互;API 场景可配置跳过,按默认口径执行'],
          ['全局引用台账(C1..Cn)', '每个 worker 自己编号', '多个 worker 必然撞到同一来源:全局去重省成本,统一编号让交叉校验和最终引用表成为可能', '台账成为单点:实现极薄(一个 dict),风险可控'],
          ['搜索结果 + 网页正文双缓存(SQLite)', '每次实时搜索抓取', '评测要反复复跑:不缓存则每次调参都在重新花钱;TTL 取决于主题；新闻、价格或政策问题需更短缓存，并记录来源时间', '缓存失效策略:带 TTL 字段,可一键清空'],
        ]} />
        <h4>项目骨架</h4>
        <FileTree name="scout/ — 项目结构">
{`scout/
├── config.py          # 预算/并发/搜索配置(预算字段占了一半,见 M2)
├── schemas.py         # Plan/SubQuestion/Finding/WorkerReport/Report…
├── llm.py             # 复用 P1 的网关模式(重试/记账/结构化输出)
├── observe.py         # 复用 P1 的 Trace
├── lead.py            # Lead Agent:澄清 → 计划 → 预算分配
├── search.py          # SearchProvider 抽象 + Tavily 实现 + SQLite 缓存
├── crawl.py           # 抓取 + 正文提取 + 截断
├── worker.py          # 子代理:搜索→选页→抓取→提炼 的小循环
├── ledger.py          # 引用台账:去重/编号/交付前验证
├── verify.py          # 交叉校验:冲突检测/孤儿引用清理
├── writer.py          # 分节撰写 + 编辑合成
└── run.py             # asyncio 编排 + 总预算熔断 + CLI
evals/
├── rubric.yaml        # 四维评分标准
└── run_rubric.py      # rubric + 来源可访问率；另建引用支持率标注集
tests/test_plan.py     # 计划结构/预算缩放的单测`}
        </FileTree>
      </Mile>

      <Mile id="p2-m2" no="M2" title="Schema 与预算:数据结构就是架构">
        <p>多智能体系统的架构,一半写在数据结构里。<b>Lead 和 Worker 之间只通过这些类型通信</b>——这意味着两边的 prompt 可以独立演进、worker 可以单独评测、坏了一个 worker 不影响别人的数据形状。请特别注意 <code style={{ fontFamily: 'var(--font-mono)' }}>SubQuestion.budget_tokens</code> 和 <code style={{ fontFamily: 'var(--font-mono)' }}>Finding.quote</code>:前者是成本控制的最小单元,后者是防幻觉的最小单元。</p>
        <CodeFile name="scout/config.py" code={`from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="SCOUT_", extra="ignore")

    # ---- 模型分工 ----
    lite_model: str = "gpt-6-luna"     # 澄清/查询改写/选页/冲突检测/judge
    main_model: str = "gpt-6.1-sol"          # 计划/提炼/写作/编辑
    api_base: str = "https://api.openai.com/v1"
    api_key: str  # 必填；通过 ATLAS_/SCOUT_ 环境变量或本地 .env 提供
    reasoning_effort: str = "low"
    max_output_tokens: int = 4096
    # 2026-10-03 标准价，$/百万 token：输入/缓存读/缓存写/输出
    model_prices: dict[str, tuple[float, float, float, float]] = {
        "gpt-6-luna": (0.10, 0.01, 0.125, 0.50),
        "gpt-6.1-sol": (2.00, 0.10, 2.50, 10.00),
    }
    embedding_base: str = "https://api.openai.com/v1"
    embedding_key: str = ""  # ATLAS 需要单独填写；可与聊天 key 同值
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1024
    embedding_price: float = 0.02  # $/百万输入 token；变更时核对索引维度
    tavily_key: str = ""               # 搜索 provider 的 key

    # ---- 预算(本项目一半的配置都是预算)----
    total_token_cap: int = 1_200_000   # 教学预算阈值；严格限额需调用前预留并发额度
    worker_token_cap: int = 150_000    # 单个 worker 上限
    max_subquestions: int = 5          # 拆得越细越贵也越散
    max_workers: int = 4               # 并发信号量:防限流也防烧钱速率失控

    # ---- 搜索与抓取 ----
    search_provider: str = "tavily"    # 可换: bing / serp / mock
    max_results_per_query: int = 8
    crawl_max_chars: int = 6000        # 每页正文截断:研究要广度,不是单页背诵
    cache_ttl_hours: int = 72          # 教学默认值；时效敏感研究应缩短 TTL

    # ---- 报告 ----
    report_target_words: int = 3000


@lru_cache
def settings() -> Settings:
    return Settings()
`} />
        <CodeFile name="scout/schemas.py" code={`"""Lead 与 Worker 只通过这些类型通信——数据结构就是架构本身。"""
from enum import Enum

from pydantic import BaseModel, Field


class Effort(str, Enum):
    """努力档:Lead 给每个子问题标注意愿成本。
    low = 常识性问题,1 轮搜索只看摘要;medium = 2 轮;high = 核心争议,3 轮深挖。"""
    low = "low"
    medium = "medium"
    high = "high"


ROUNDS = {Effort.low: 1, Effort.medium: 2, Effort.high: 3}


class SubQuestion(BaseModel):
    id: str                                  # "SQ1"
    question: str                            # 独立可搜索,不依赖兄弟结论
    why: str                                 # 服务于总问题的哪一部分(强制说理)
    effort: Effort
    budget_tokens: int                       # Lead 分配——worker 的最大钱包


class ResearchPlan(BaseModel):
    title: str
    subquestions: list[SubQuestion]
    total_budget_tokens: int


class Finding(BaseModel):
    """Worker 的最小交付物:一条结论 + 来源。quote 是防幻觉的锚——
    摘录真实性和事实支持率须另做内容核查，台账仅检测来源可达性。"""
    claim: str
    urls: list[str]
    quote: str = ""
    confidence: float = Field(ge=0, le=1, default=0.8)


class WorkerReport(BaseModel):
    subquestion_id: str
    findings: list[Finding]
    dead_ends: list[str] = []                # 走过的死路,写进 trace 供复盘
    tokens_used: int = 0


class Citation(BaseModel):
    cid: str                                 # 全局编号 "C1"
    url: str
    title: str
    verification: str = "unverified"  # reachable / unverified；可达不代表支持事实


class Section(BaseModel):
    heading: str
    content: str                             # 正文,内嵌 [C1] 标记


class Report(BaseModel):
    title: str
    executive_summary: str
    sections: list[Section]
    sources: list[Citation] = []             # 台账验证后的存活引用
    open_questions: list[str] = []           # 没查证清楚的,明说
    disclaimer: str = "本报告由 AI 生成,仅供研究参考,不构成投资建议。"
`}
        />
        <div className="card tip">
          <span className="card-tag">✔ 设计对照:ATLAS vs SCOUT 的 schemas</span>
          <p style={{ margin: '4px 0 0' }}>注意两个项目 schema 的气质差异:ATLAS 的类型围着「<b>权限与引用</b>」转(ToolResult.needs_human、Citation.quote),因为客服的风险是「乱来」;SCOUT 的类型围着「<b>预算与溯源</b>」转(budget_tokens、confidence、dead_ends),因为研究的风险是「花钱买回一堆查无实据的文字」。schema 设计就是在回答:这个系统的失败模式是什么?</p>
        </div>
      </Mile>
    </>
  )
}
