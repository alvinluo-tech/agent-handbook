import { Mile, CodeFile, Kpis } from './labbits.jsx'

/* P2 SCOUT · M3 Lead 规划 + M4 Worker 子代理 */
export default function P2b() {
  return (
    <>
      <Mile id="p2-m3" no="M3" title="Lead Agent:澄清、拆解、分钱">
        <p>Anthropic 在多代理研究系统的复盘中写得直白:<b>Lead 的任务描述质量直接决定输出质量</b>——它教会 Lead「拆多少个、每个怎么描述、花多少钱」。SCOUT 把这三件事拆成三段代码,每段都可独立测试。</p>

        <h4>第一步:澄清——问题歧义是返工之母</h4>
        <p>「分析一下新能源市场」这种问题,不同人心里的时间范围、地域、产业链位置可能完全不同。让 Lead 先花一次 lite 模型调用判断「能不能开工」,不能就问——这是全流程<b>性价比最高的一次调用</b>。</p>
        <CodeFile name="scout/lead.py(澄清与计划)" code={`"""Lead Agent:研究系统的「首席研究员」。
三段职责:澄清 → 拆解 → 分预算。每段一次 LLM 调用,全部可单测。"""
from pydantic import BaseModel

from atlas import lead as _  # noqa: F401  ——(示意:llm/observe 与 P1 同构,此处从本包导入)
from scout.config import settings
from scout.llm import chat_json
from scout.observe import Trace
from scout.schemas import ResearchPlan, SubQuestion


class Clarify(BaseModel):
    """空 questions = 可以直接开工。"""
    questions: list[str] = []


CLARIFY_SYSTEM = """你是研究助理。判断研究问题是否明确到可以开工:
缺少关键口径(时间范围/地域/行业定义/对比对象)时,生成至多 2 个澄清问题;
足够明确则输出空列表。问题要具体、可直接回答,不要反问语气。只输出 JSON。"""

PLAN_SYSTEM = """你是首席研究员,负责把总问题拆解为研究计划。
规则:
1. 子问题 3-{max_sq} 个:互不重叠,合起来完整覆盖总问题;
2. 每个子问题独立可搜索——不依赖另一个子问题的结论(它们将并行执行);
3. 每个子问题标注努力档 effort:low(常识性)/ medium(常规)/ high(核心争议点);
4. 按重要性分配 budget_tokens,总和必须等于 {budget};
5. why 字段说明该子问题服务总问题的哪个部分。只输出 JSON。"""


def maybe_clarify(question: str, trace: Trace) -> list[str]:
    out: Clarify = chat_json(settings().lite_model,
                             [{"role": "system", "content": CLARIFY_SYSTEM},
                              {"role": "user", "content": question}],
                             Clarify, trace)
    return out.questions[:2]


def make_plan(question: str, budget: int, trace: Trace) -> ResearchPlan:
    """产出研究计划。关键在「不信任模型的算术」:
    预算超支就等比缩放,子问题超量就截断——结构性约束永远在代码里兜底。"""
    plan: ResearchPlan = chat_json(
        settings().main_model,
        [{"role": "system",
          "content": PLAN_SYSTEM.format(max_sq=settings().max_subquestions,
                                        budget=budget)},
         {"role": "user", "content": question}],
        ResearchPlan, trace)
    total = sum(s.budget_tokens for s in plan.subquestions)
    if total > budget and total > 0:                 # 模型超支:等比缩放到预算内
        scale = budget / total
        for s in plan.subquestions:
            s.budget_tokens = int(s.budget_tokens * scale)
    plan.subquestions = plan.subquestions[: settings().max_subquestions]
    for i, s in enumerate(plan.subquestions):        # 统一编号,别指望模型
        s.id = f"SQ{i + 1}"
    trace.event("plan", subquestions=len(plan.subquestions),
                budget=sum(s.budget_tokens for s in plan.subquestions))
    return plan
`} note="测试技巧:make_plan 的预算缩放是纯函数逻辑——mock 掉 chat_json 返回一个超支计划,单测缩放结果(见 tests/test_plan.py)。" />
        <div className="card idea">
          <span className="card-tag">💡 为什么「计划 JSON」比「计划自由文本」好</span>
          <p style={{ margin: 0 }}>三个硬理由:① <b>可校验</b>——预算总和、子问题数量这些结构约束在代码里检查,而不是祈祷模型守规矩;② <b>可执行</b>——asyncio 直接遍历 subquestions 并发派活,不需要再解析一次文本;③ <b>可评测</b>——「计划覆盖率」这个指标的前提,是计划本身是结构化数据。</p>
        </div>
      </Mile>

      <Mile id="p2-m4" no="M4" title="Worker:自带钱包的并行子代理">
        <p>Worker 是一个「<b>小而完整的 agent</b>」:自己搜索、自己挑页、自己抓取、自己提炼,在预算内自决。它有四条铁律,每条都对应一种真实的事故:</p>
        <Kpis items={[
          ['上下文独立', 'worker 只见自己的子问题——隔离脏上下文,主线程永保干净'],
          ['只回压缩结论', 'findings ≤ 6 条 + 原文摘录,网页全文绝不回流主线程'],
          ['预算内自决', 'token 花到预算 80% 就不再开新一轮搜索'],
          ['失败即降级', '单 URL/单轮失败只记 dead_end,绝不抛出拖垮全局'],
        ]} />
        <h4>搜索抽象层 + 双缓存</h4>
        <p>搜索引擎是外部依赖,必须抽象成 Provider 接口:Tavily、Bing、SerpAPI 或公司内部 ES 可以热插拔(评测时用 Mock Provider 零成本跑通流程)。<b>缓存不是优化项,是评测的前提</b>——你要反复复跑同一份研究来对比参数,不缓存就是每次调参都重新烧钱。</p>
        <CodeFile name="scout/search.py" code={`"""搜索抽象层:Provider 可替换 + SQLite 双缓存(查询级)。
为什么缓存:同一查询会被多个 worker / 多次复跑触达,不缓存 = 重复花钱。"""
import hashlib
import json
import sqlite3
import time
from pathlib import Path
from typing import Protocol

from pydantic import BaseModel

from scout.config import settings

CACHE_DB = Path("scout_cache.sqlite3")


class SearchResult(BaseModel):
    url: str
    title: str
    snippet: str


class SearchProvider(Protocol):
    def search(self, query: str, k: int) -> list[SearchResult]: ...


class TavilyProvider:
    """延迟导入:没装 SDK / 没 key 时,换 mock provider 照样能跑通全流程。"""
    def __init__(self):
        from tavily import TavilyClient
        self.client = TavilyClient(api_key=settings().tavily_key)

    def search(self, query: str, k: int) -> list[SearchResult]:
        resp = self.client.search(query=query, max_results=k)
        return [SearchResult(url=r["url"], title=r["title"],
                             snippet=r.get("content", "")[:300])
                for r in resp["results"]]


class MockProvider:
    """离线开发/单测用:固定返回,让全流程不花一分钱就能跑通。"""
    def search(self, query: str, k: int) -> list[SearchResult]:
        return [SearchResult(url="https://example.com/mock",
                             title=f"mock: {query}", snippet="mock content")] * min(k, 3)


def _provider() -> SearchProvider:
    return {"tavily": TavilyProvider, "mock": MockProvider}.get(
        settings().search_provider, MockProvider)()


def _conn() -> sqlite3.Connection:
    c = sqlite3.connect(CACHE_DB)
    c.execute("""CREATE TABLE IF NOT EXISTS cache(
                 key TEXT PRIMARY KEY, payload TEXT, ts REAL)""")
    return c


def cached_search(query: str, k: int, trace) -> list[SearchResult]:
    key = hashlib.sha1(f"{query}|{k}".encode()).hexdigest()
    ttl = settings().cache_ttl_hours * 3600
    with _conn() as c:
        row = c.execute("SELECT payload, ts FROM cache WHERE key=?",
                        (key,)).fetchone()
        if row and time.time() - row[1] < ttl:
            trace.event("search", hit=True, query=query)
            return [SearchResult(**r) for r in json.loads(row[0])]
    results = _provider().search(query, k)
    with _conn() as c:
        c.execute("INSERT OR REPLACE INTO cache(key, payload, ts) VALUES (?,?,?)",
                  (key, json.dumps([r.model_dump() for r in results]), time.time()))
    trace.event("search", hit=False, query=query, results=len(results))
    return results
`} />
        <CodeFile name="scout/crawl.py" code={`"""抓取 + 正文提取 + 截断。
只抓正文:导航栏/页脚/广告是 token 小偷,trafilatura 一刀切掉。
失败容忍:单页失败返回空串,由调用方记 dead_end——多源研究天然冗余。"""
import httpx
import trafilatura


def fetch_clean(url: str, max_chars: int) -> str:
    try:
        resp = httpx.get(url, timeout=15, follow_redirects=True,
                         headers={"User-Agent": "ScoutBot/1.0 (research; contact=you@example.com)"})
        resp.raise_for_status()
        text = trafilatura.extract(resp.text) or ""
        return text[:max_chars]
    except Exception:
        return ""
`} />
        <h4>worker.py:小循环 + 钱包 + 压缩回传</h4>
        <p>Worker 的循环形状值得细看:<b>每一轮 = 改写查询 → 搜索 → 挑页 → 抓取 → 提炼</b>,轮数由努力档决定。所有「决策型」调用(改写查询、挑页)用 lite 模型,只有「提炼结论」用 main 模型——这是 worker 内部的成本分配。最关键的接口约定:<code style={{ fontFamily: 'var(--font-mono)' }}>run_subquestion</code> 永远返回 WorkerReport,任何异常都被转成部分结果。</p>
        <CodeFile name="scout/worker.py" code={`"""Worker:自带独立上下文与钱包的子代理。

四条铁律(每条都来自真实事故):
1. 上下文独立:只看到自己的子问题,看不到主线程的一切;
2. 只回压缩结论:findings ≤ 6 条,网页全文绝不回流;
3. 预算内自决:花到预算 80% 不再开新一轮;
4. 失败即降级:任何异常 → 部分结果,绝不抛出。"""
from pydantic import BaseModel

from scout.config import settings
from scout.crawl import fetch_clean
from scout.ledger import Ledger
from scout.llm import chat_json
from scout.observe import Trace
from scout.schemas import Finding, ROUNDS, SubQuestion, WorkerReport
from scout.search import cached_search

WORKER_SYSTEM = """你是研究员,只负责一个子问题:{question}
执行方式(每轮):搜索 → 挑选最可信的 2-3 个来源 → 读正文 → 提炼结论。
纪律:
- 每条 Finding 必须来自页面原文:附 URL 与不超过 50 字的关键摘录;
- 来源相互矛盾时,两条都记录,并调低 confidence;
- 已有结论足够回答子问题时,立即停止搜索;
- 禁止编造。拿不准就少写。"""


class _Picks(BaseModel):
    """让 lite 模型从搜索结果里挑页:标题+摘要就够判断,不必抓全文。"""
    indices: list[int] = []


class _NextQuery(BaseModel):
    q: str = ""


class _Findings(BaseModel):
    findings: list[Finding] = []


def run_subquestion(sq: SubQuestion, ledger: Ledger, trace: Trace) -> WorkerReport:
    parent_trace = trace
    trace = Trace(f"{parent_trace.sid}-{sq.id}", token_cap=sq.budget_tokens)  # worker 独立用量，不读共享列表末项
    findings: list[Finding] = []
    dead_ends: list[str] = []
    limit = int(sq.budget_tokens * 0.8)
    try:
        for _round in range(ROUNDS[sq.effort]):
            if trace.total_tokens >= limit:
                break
            query = _next_query(sq, findings, trace)
            results = cached_search(query, settings().max_results_per_query, trace)
            picks = _pick(sq.question, results, trace)
            for idx in picks:
                if trace.total_tokens >= limit:
                    break
                url = results[idx].url
                if ledger.seen(url):
                    continue
                body = fetch_clean(url, settings().crawl_max_chars)
                if not body:
                    dead_ends.append(url)
                    continue
                ledger.cite(url, results[idx].title)
                findings += _extract(sq, url, results[idx].title, body, trace)
        trace.event("worker_done", sub=sq.id, tokens=trace.total_tokens,
                    findings=len(findings), dead_ends=len(dead_ends))
    except Exception as err:
        # 已产生的费用仍会合并；保留部分结果，不把未知费用记成零。
        trace.event("worker_failed", sub=sq.id, error=type(err).__name__)
        dead_ends.append(f"worker failed: {type(err).__name__}")
    finally:
        parent_trace.merge(trace)
    return WorkerReport(subquestion_id=sq.id, findings=findings[:6],
                        dead_ends=dead_ends, tokens_used=trace.total_tokens)


def _next_query(sq: SubQuestion, findings: list[Finding], trace) -> str:
    """查询改写:根据已有结论决定下一发搜什么(找补证据?换角度?)。
    第一轮直接用子问题原文;之后让 lite 模型看结论生成补充查询。"""
    if not findings:
        return sq.question
    out: _NextQuery = chat_json(settings().lite_model,
                                [{"role": "system",
                                  "content": "基于已有发现,生成一个补充搜索查询:查漏、找反例或换角度。只输出 JSON {\\"q\\": \\"...\\"}"},
                                 {"role": "user",
                                  "content": f"子问题: {sq.question}\\n已有结论: "
                                             + "; ".join(f.claim for f in findings)}],
                                _NextQuery, trace)
    return out.q or sq.question


def _pick(question: str, results: list, trace) -> list[int]:
    """挑页:域名权重、标题相关性都交给模型综合判断,比手写规则鲁棒。"""
    listing = "\\n".join(f"{i}: {r.title} | {r.snippet[:120]}"
                        for i, r in enumerate(results))
    out: _Picks = chat_json(settings().lite_model,
                            [{"role": "system",
                              "content": '从搜索结果中挑出最值得抓取正文的 2-3 个来源(更权威、更直接回答问题)。只输出 JSON {"indices": [序号]}'},
                             {"role": "user", "content": f"问题: {question}\\n{listing}"}],
                            _Picks, trace)
    return [i for i in out.indices if 0 <= i < len(results)][:3]


def _extract(sq, url, title, body, trace) -> list[Finding]:
    """提炼：格式与本地结构校验；用量由本 worker 的 Trace 统一记录。"""
    out: _Findings = chat_json(settings().main_model,
                               [{"role": "system",
                                 "content": WORKER_SYSTEM.format(question=sq.question)},
                                {"role": "user",
                                 "content": (f"来源: {title} ({url})\\n正文:\\n{body}"
                                             f"\\n只输出 JSON: {{\\"findings\\": [...]}}")}],
                               _Findings, trace)
    return out.findings
`} note="预算用真实 token 比较，包括查询改写、挑页与提炼；费用另按 usage 记录。每个 worker 独立 Trace，结束后原子合并，避免并发串账。" />
        <div className="card warn">
          <span className="card-tag">⚠ 一处刻意的简化(以及生产上怎么做)</span>
          <p style={{ margin: '4px 0 0' }}>这里已经使用具名 Pydantic schema。预算检查是在调用边界进行，单次输入、输出和已在途并发仍可能超过剩余额度；严格费用上限需调用前预留、并发原子额度与最终对账。<b>真实项目请像 <code style={{ fontFamily: 'var(--font-mono)' }}>_Picks</code> 一样,把每个 schema 定义成具名类放进 schemas.py</b>——可读、可复用、可测试。这是「教程代码」与「评审代码」的差别,面试时主动指出这类简化,是加分项。</p>
        </div>
      </Mile>
    </>
  )
}
