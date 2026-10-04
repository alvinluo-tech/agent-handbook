import { Mile, CodeFile, Kpis, Res, LabFoot } from './labbits.jsx'
import { FigScoutLedger } from './diag.jsx'
import { LABS } from './registry.js'

const lab = LABS[1]

export default function P2c({ onGo }) {
  return (
    <>
      <Mile id="p2-m5" no="M5" title="台账、校验与写作:让引用经得起点击">
        <h4>ledger.py:全局引用台账——「宁少引用,不假引用」</h4>
        <p>台账是 SCOUT 里最不起眼、却最能区分「能用的」和「演示的」组件。三个 worker 并行研究,几乎必然撞到同一批来源——没有台账,引用表就会出现重复编号和指向冲突。台账顺带承担<b>交付前验证</b>:链接失效是最常见的「慢性假引用」,交付前检查来源可达性；HEAD 失败可能只是站点策略，不证明内容不存在。引用是否支持结论还需原文核对。</p>
        <FigScoutLedger />
        <CodeFile name="scout/ledger.py" code={`"""引用台账:全局唯一的 URL → Cn 编号。三个职责:
1. 跨 worker 去重(并行研究必然撞源);
2. 为写作层提供统一引用表;
3. 交付前检测可达性；未核验来源保留状态，不无声删除引用。"""
import httpx

from scout.observe import Trace
from scout.schemas import Citation
from threading import RLock


class Ledger:
    def __init__(self):
        self._lock = RLock()
        self._by_url: dict[str, Citation] = {}
        self._dead: set[str] = set()

    def seen(self, url: str) -> bool:
        with self._lock:
            return url in self._by_url or url in self._dead

    def mark_dead(self, url: str) -> None:
        with self._lock:
            self._dead.add(url)

    def cite(self, url: str, title: str) -> Citation:
        """worker 抓取成功后立即登记;同一 URL 无论几个 worker 触达,只有一个编号。"""
        with self._lock:
            if url not in self._by_url:
                self._by_url[url] = Citation(cid=f"C{len(self._by_url) + 1}",
                                             url=url, title=title)
            return self._by_url[url]

    def all(self) -> list[Citation]:
        with self._lock:
            return list(self._by_url.values())

    def verify(self, trace: Trace) -> list[Citation]:
        """只检查可达性，不测摘录真假或 claim 支持率；失败保留未核验状态。"""
        citations = self.all()
        for cit in citations:
            try:
                # 此核心片段仅 HEAD；GET 回退必须经外网代理、DNS/重定向校验和字节上限。
                # 不自动请求任意 URL 的 GET，避免把核查器变成 SSRF 下载器。
                resp = httpx.head(cit.url, timeout=8, follow_redirects=False)
                ok = 200 <= resp.status_code < 300
            except Exception:
                ok = False
            cit.verification = "reachable" if ok else "unverified"
            trace.event("cite_check", cid=cit.cid, verification=cit.verification)
        return citations
`} />
        <h4>writer.py:两阶段写作——分节生成,编辑合成</h4>
        <p>不让主模型一口气写 3000 字,原因在 CH.04 就讲过:<b>长输出可能遗漏约束或降低一致性，需要在任务上验证</b>。分节生成让每一节只带自己需要的素材(上下文小而准),还能天然并行;「编辑合成」阶段只做整合——去重、统一风格、写执行摘要——并在 prompt 里明令禁止引入新事实。<b>写作可以发挥,事实必须守住来源</b>,这条边界要写进系统提示。</p>
        <CodeFile name="scout/writer.py" code={`"""两阶段写作:分节撰写(聚焦、可并行)→ 编辑合成(一致性)。
写作可以发挥文风,事实必须守住来源——边界写进系统提示。"""
from pydantic import BaseModel

from scout.config import settings
from scout.llm import chat, chat_json
from scout.observe import Trace
from scout.schemas import Citation, Report, ResearchPlan, Section, WorkerReport

SECTION_SYSTEM = """你是研究简报作者。为章节「{heading}」写 400-800 字正文:
- 只使用【素材】里给出的信息,每个事实句尾标注 [Cn] 引用编号;
- 素材不足就少写,绝不注水;
- 结论先行,再给论据;中立呈现,不写营销腔。
只输出 JSON: {{"heading": "...", "content": "..."}}
"""


class _SectionOut(Section):
    pass


def write_sections(plan: ResearchPlan, reports: list[WorkerReport],
                   citations: list[Citation], trace: Trace) -> list[Section]:
    cite_table = "\\n".join(f"{c.cid}: {c.title} ({c.url})" for c in citations)
    by_sub = {r.subquestion_id: r for r in reports}
    sections: list[Section] = []
    for sq in plan.subquestions:
        rep = by_sub.get(sq.id)
        if not rep or not rep.findings:
            continue          # 这个子问题颗粒无收:留白,交给编辑在摘要里说明
        findings = "\\n".join(
            f"- {f.claim}(来源: {', '.join(f.urls)};"
            f" 摘录: {f.quote[:80]}; 置信: {f.confidence})"
            for f in rep.findings)
        out: _SectionOut = chat_json(
            settings().main_model,
            [{"role": "system",
              "content": SECTION_SYSTEM.format(heading=sq.question)},
             {"role": "user",
              "content": f"【引用表】\\n{cite_table}\\n\\n【素材】\\n{findings}"}],
            _SectionOut, trace)
        sections.append(Section(heading=out.heading, content=out.content))
    return sections


def edit_report(question: str, sections: list[Section], trace: Trace) -> Report:
    """编辑合成:只做去重/衔接/风格/执行摘要,禁止引入新事实。"""
    body = "\\n\\n".join(f"## {s.heading}\\n{s.content}" for s in sections)
    return chat_json(settings().main_model,
               [{"role": "system",
                 "content": ("你是研究简报的主编。把各章节整合为完整报告:统一术语与风格,"
                             "消除重复,写 150 字执行摘要,列出仍未查证的问题。"
                             "禁止引入素材之外的新事实;保留所有 [Cn] 引用标记。"
                             '只输出 JSON: {"title": "...", "executive_summary": "...",'
                             ' "sections": [{"heading": "...", "content": "..."}],'
                             ' "open_questions": ["..."]}')},
                {"role": "user", "content": f"研究问题: {question}\\n\\n{body}"}],
               Report, trace)
`} />
        <h4>verify.py 与 run.py:收口</h4>
        <CodeFile name="scout/verify.py" code={`"""交付前的最后一道质检:孤儿引用清理 + 冲突标注。"""
import re

from pydantic import BaseModel

from scout.config import settings
from scout.llm import chat_json
from scout.observe import Trace
from scout.schemas import Report

CITED = re.compile(r"\\[C(\\d+)\\]")


class _Conflicts(BaseModel):
    conflicts: list[str] = []


CONFLICT_SYSTEM = """你是事实核查员。下面是同一研究的多条结论,
找出相互矛盾的组,每组用一句话描述矛盾点;没有矛盾输出空列表。
只输出 JSON: {"conflicts": ["..."]}
"""


def check_and_clean(report: Report, findings, valid_cids: set[str],
                    trace: Trace) -> Report:
    # 引用缺失时保留原标记并明确未核验，覆盖摘要与所有正文。
    def annotate(text):
        def replace(match):
            cid = f"C{match.group(1)}"
            if cid in valid_cids:
                return match.group(0)
            trace.event("unverified_citation", cid=cid)
            report.open_questions.append(f"{cid} 来源未核验，相关结论须复核")
            return match.group(0) + "（来源未核验，相关结论待复核）"
        return CITED.sub(replace, text)
    report.executive_summary = annotate(report.executive_summary)
    for sec in report.sections:
        sec.content = annotate(sec.content)
    # 2) 冲突检测:矛盾点不是删掉,而是显式标注进 open_questions
    claims = "\\n".join(f"- {f.claim}(conf={f.confidence})" for f in findings)
    out: _Conflicts = chat_json(settings().lite_model,
                                [{"role": "system", "content": CONFLICT_SYSTEM},
                                 {"role": "user", "content": claims}],
                                _Conflicts, trace)
    report.open_questions = list(dict.fromkeys(
        report.open_questions + out.conflicts))
    return report
`} note="摘要与正文均保留未核验引用及标记；来源可达不等于摘录真实或支持结论。仅 HEAD 检查的局限是显式的。" />
        <CodeFile name="scout/run.py" code={`"""编排:整个系统的 main()。
asyncio + 信号量控并发:防搜索 API 限流,也防 token 烧钱速率失控;
worker 跑在线程池里(to_thread),因为它内部是同步 HTTP/DB 调用。"""
import asyncio
import sys
from pathlib import Path
from uuid import uuid4

from scout import lead, verify, worker, writer
from scout.config import settings
from scout.ledger import Ledger
from scout.observe import Trace
from scout.schemas import Report, WorkerReport


async def research(question: str, clarify_cb=None) -> Report:
    tr = Trace("scout", token_cap=settings().total_token_cap)
    try:
        # 1) 澄清:CLI 用 input,API 场景传入回调(或返回问题给前端)
        for q in lead.maybe_clarify(question, tr):
            ans = clarify_cb(q) if clarify_cb else input(f"澄清: {q}\\n> ")
            question = f"{question}\\n(口径·{q}: {ans})"
    
        # 2) 计划与预算分配
        plan = lead.make_plan(question, settings().total_token_cap, tr)
    
        # 3) 并行 workers:单个失败不拖垮全局,缺哪个子问题报告就少哪节
        ledger = Ledger()
        sem = asyncio.Semaphore(settings().max_workers)
    
        async def guarded(sq):
            async with sem:
                return await asyncio.to_thread(worker.run_subquestion, sq, ledger, tr)
    
        results = await asyncio.gather(
            *(guarded(sq) for sq in plan.subquestions), return_exceptions=True)
        reports = [r for r in results if isinstance(r, WorkerReport)]
        if len(reports) < len(results):
            tr.event("workers_failed", count=len(results) - len(reports))
        findings = [f for r in reports for f in r.findings]
    
        # 4) 台账可达性验证(保留未核验状态)→ 5) 两阶段写作 → 6) 终检
        citations = ledger.verify(tr)
        sections = writer.write_sections(plan, reports, citations, tr)
        report = writer.edit_report(question, sections, tr)
        report = verify.check_and_clean(report, findings,
                                        {c.cid for c in citations if c.verification == "reachable"}, tr)
        report.sources = citations
        tr.event("done", sections=len(report.sections),
                 cost_usd=round(tr.total_cost_usd, 4))
        return report
    finally:
        tr.dump()


def render(report: Report) -> str:
    lines = [f"# {report.title}", "", report.executive_summary, ""]
    for s in report.sections:
        lines += [f"## {s.heading}", "", s.content, ""]
    if report.open_questions:
        lines += ["## 未查证清楚的问题", ""]
        lines += [f"- {q}" for q in report.open_questions] + [""]
    lines += ["## 参考来源", ""]
    lines += [f"- {c.cid} {c.title} — {c.url}（{c.verification}；可达不代表支持事实）" for c in report.sources]
    lines += ["", "---", report.disclaimer]
    return "\\n".join(lines)


if __name__ == "__main__":
    q = sys.argv[1] if len(sys.argv) > 1 else input("研究问题 > ")
    rpt = asyncio.run(research(q))
    md = render(rpt)
    root = Path("reports").resolve()
    root.mkdir(parents=True, exist_ok=True)
    out = root / f"{uuid4().hex}.md"  # 模型标题只用于展示
    out.write_text(md, encoding="utf-8")
    print(md)
    print(f"\\n[saved] {out} | cost: ¥— 见 traces/scout.jsonl")
`} />
      </Mile>

      <Mile id="p2-m6" no="M6" title="评测与成本:给「质量」装上仪表盘">
        <p>报告可用 rubric 辅助评测，但 judge 需人工校准。下方函数只测<b>来源可访问率</b>：能否抓到正文；它不核对摘录和 claim。<b>引用支持率</b>须逐条检查结论→引用→原文证据，并由人工抽样复核，两项指标分开报告。</p>
        <CodeFile name="evals/rubric.yaml + run_rubric.py" code={`# evals/rubric.yaml —— 让 judge 按"逐条标准"打分,而不是给一个笼统的印象分
criteria:
  - { id: coverage, desc: "报告是否覆盖研究计划中的全部子问题", weight: 3 }
  - { id: grounded, desc: "事实性陈述是否都有 [Cn] 引用且摘录支持", weight: 3 }
  - { id: balance,  desc: "争议问题是否呈现多方说法而非单一立场", weight: 2 }
  - { id: honesty,  desc: "查证不清的点是否进了 open_questions 而非被掩盖", weight: 2 }
# ------ evals/run_rubric.py(核心逻辑) ------
"""rubric 评测 + 来源可访问率。复跑会命中搜索缓存,成本主要是 LLM 调用。"""
import asyncio, json, pathlib
import yaml

from scout.run import research
from scout.crawl import fetch_clean
from scout.config import settings
from scout.llm import chat
from scout.observe import Trace

CRITERIA = yaml.safe_load(pathlib.Path("evals/rubric.yaml").read_text("utf-8"))["criteria"]

RUBRIC_PROMPT = """你是研究质量评审员。按以下标准逐条给报告打 0-10 分:
{criteria}
只输出 JSON: {{"scores": [{{"id": "...", "score": n, "note": "一句话依据"}}]}}"""


def weighted_score(scores: list[dict]) -> float:
    w = {c["id"]: c["weight"] for c in CRITERIA}
    seen = {s["id"]: s["score"] for s in scores}
    if len(seen) != len(scores) or set(seen) != set(w):
        raise ValueError("rubric 项缺失、重复或未知")
    if any(not isinstance(v, (int, float)) or not 0 <= v <= 10 for v in seen.values()):
        raise ValueError("rubric 分数不在 0–10")
    return sum(seen[k] * w[k] for k in w) / sum(w.values())          # 0-10


def source_accessibility(report, trace) -> float:
    """只测能否抓取正文；不代表引用支持率或事实正确率。"""
    if not report.sources:
        return 0.0
    alive = sum(1 for c in report.sources if fetch_clean(c.url, 2000))
    trace.event("source_accessibility", alive=alive, total=len(report.sources))
    return alive / len(report.sources)


def run(questions: list[str], min_score: float = 8.0, min_accessibility: float = 0.95):
    if not questions:
        raise ValueError("评测题集不能为空")
    tr = Trace("eval")
    rows = []
    for q in questions:
        report = asyncio.run(research(q, clarify_cb=lambda _q: "近 12 个月,全球范围"))
        text = "\\n".join([report.title, report.executive_summary]
                          + [s.content for s in report.sections])
        raw = chat(settings().lite_model, [
            {"role": "system", "content": RUBRIC_PROMPT.format(criteria=CRITERIA)},
            {"role": "user", "content": text}], tr)
        parsed = json.loads(raw)["scores"]
        rows.append({"q": q, "score": weighted_score(parsed),
                     "accessibility": round(source_accessibility(report, tr), 3)})
    avg = sum(r["score"] for r in rows) / len(rows)
    prec = sum(r["accessibility"] for r in rows) / len(rows)
    print(f"rubric 加权均分 {avg:.1f}/10 · 来源可访问率 {prec:.0%}")
    assert avg >= min_score and prec >= min_accessibility, "评测未达标,禁止发布"
`} />
        <Kpis items={[
          ['按实测', 'worker 费用：查询、挑页、提炼调用全部计入'],
          ['配置预算', '报告费用按模型、用量与缓存状态分项核算'],
          ['同任务对照', '比较单 Agent 与多 Agent 的质量、用量和费用'],
          ['按实测', '缓存有效期、命中率与复跑边际费用'],
          ['按实测', '并发收益取决于限流、依赖与单次执行时长'],
        ]} />
        <div className="card tip">
          <span className="card-tag">✔ 进阶方向</span>
          <ul style={{ margin: '4px 0 0' }}>
            <li><b>增量更新</b>:只重跑发生变化的子问题(计划 hash 不变的跳过),周报场景的收益按同配置复跑比较。</li>
            <li><b>证据包导出</b>:报告 + 引用表 + trace 打包 zip——投研场景的合规审计刚需,也是「可解释性」的最佳实物。</li>
            <li><b>风格记忆</b>:分析师对报告的批注(太啰嗦/要更多数据)沉淀成写作偏好,注入 SECTION_SYSTEM——记忆系统(CH.09)的迷你实践。</li>
            <li><b>失败注入测试</b>:mock provider 定时抛异常,验证「worker 挂掉报告仍能交付」的降级路径真的可用。</li>
          </ul>
        </div>
      </Mile>

      <Mile id="p2-res" no="END" title="简历与面试:多智能体是话题之王">
        <Res>
          <ul style={{ margin: '4px 0 0' }}>
            <li><b>项目名:</b>SCOUT——多智能体深度研究系统(对标 OpenAI Deep Research 架构)</li>
            <li><b>一句话:</b>orchestrator-worker 多智能体编排,把研究问题转化为带引用、可审计的研究简报。</li>
            <li><b>bullet 1:</b>设计三层 token 预算体系(报告/子问题/轮次)与努力档机制,在 [任务/模型配置] 上记录单份报告成本 [实测值]；调用边界预检、超支降档，严格上限需预留并发额度。</li>
            <li><b>bullet 2:</b>实现全局引用台账与交付前验证(URL 去重、死链剔除、摘录核对),测得来源可访问率 [实测值]、人工核验的引用支持率 [实测值]；不宣称幻觉归零;冲突结论显式标注而非静默取舍。</li>
            <li><b>bullet 3:</b>asyncio 信号量并发 + 线程池编排,worker 级故障隔离(单点失败报告降级交付);搜索 Provider 抽象 + 双缓存,相同配置下评测复跑费用变化 [实测值]。</li>
          </ul>
        </Res>
        <h4>面试深挖题</h4>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th style={{ width: '38%' }}>面试官会问</th><th>你的回答要点</th></tr></thead>
            <tbody>
              <tr><td><b>多智能体费用与并发预算，怎么控?</b></td><td>三层预算(总/子/轮)+ 努力档 + lite/main 分工(决策型调用用 lite)+ 缓存 + 熔断降级(缺一节,不缺真实性)。强调「预算是数据结构的一部分」(SubQuestion.budget_tokens),不是事后统计。</td></tr>
              <tr><td><b>worker 之间会互相污染吗?</b></td><td>上下文完全隔离,唯一共享物是台账(去重是功能,不是污染);dead_ends 只进 trace。主动提反面:Cognition《Don't Build Multi-Agents》指出的「碎片化上下文导致决策冲突」——SCOUT 用「Lead 统一编辑合成」规避:所有观点在主线程汇合时由单一编辑裁定。</td></tr>
              <tr><td><b>怎么保证引用不是编的?</b></td><td>三道闸:worker 纪律(quote 必填)→ 来源可达性检查(失败保留核验状态)→ 另做原文摘录/claim 支持率评测并人工校准；当前示例的可达性函数不实现这一步。再主动承认残余风险:摘录真实但结论过度引申的情况仍需人工抽检——评估的边界意识是高分项。</td></tr>
              <tr><td><b>并发数为什么是 3-5?怎么定的?</b></td><td>三个约束的交集:搜索 API 限流(QPS)、单 worker token 速率、报告时长目标;压测找拐点;信号量可配置所以线上可调。这题考的是「性能参数是算出来的还是拍脑袋的」。</td></tr>
              <tr><td><b>和直接用 LangGraph 写有什么区别?</b></td><td>答判断不答站队:SCOUT 的编排核心是「gather + 信号量 + 预算拦截」约 40 行,引入图框架的收益(条件边、checkpoint)在此场景不显著;若需求演化出人审节点/长事务,LangGraph 的 checkpoint 才开始值回票价。</td></tr>
            </tbody>
          </table>
        </div>
        <LabFoot lab={lab} onGo={onGo} keys={['p1', 'p2', 'p3']} />
      </Mile>
    </>
  )
}
