import { Mile, CodeFile, Kpis, Res, LabFoot } from './labbits.jsx'
import { LABS } from './registry.js'

const lab = LABS[2]

export default function P3c({ onGo }) {
  return (
    <>
      <Mile id="p3-m5" no="M5" title="GitHub 集成:webhook、幂等与回写">
        <h4>github.py:验签与最小权限 API 封装</h4>
        <p>两个安全要点。<b>HMAC 验签</b>:webhook 端点是公网可达的,任何人都能 POST 假事件——GitHub 用共享密钥对每个请求做了 HMAC-SHA256 签名,验签必须用恒定时间比较(防止时序攻击)。<b>最小权限</b>:用一个 fine-grained PAT,只开「contents: read + pull requests: write」,它不需要也不应该拥有更多。</p>
        <CodeFile name="sentinel/github.py" code={`"""GitHub 集成:验签 + 最小权限 API 封装。
凭据:fine-grained PAT,只开 contents:read + pull_requests:write。"""
import base64
import hashlib
import hmac

import httpx

from sentinel.config import settings
from sentinel.models import PRContext


def verify_signature(body: bytes, signature: str | None) -> bool:
    """恒定时间比较:防止逐字节试探签名的时序攻击。"""
    mac = hmac.new(settings().webhook_secret.encode(), body, hashlib.sha256)
    expect = f"sha256={mac.hexdigest()}"
    return hmac.compare_digest(expect, signature or "")


class GitHub:
    def __init__(self):
        self.c = httpx.Client(
            base_url="https://api.github.com",
            headers={"Authorization": f"Bearer {settings().github_token}",
                     "Accept": "application/vnd.github+json"},
            timeout=20)

    def get_pr(self, repo: str, number: int) -> PRContext:
        response = self.c.get(f"/repos/{repo}/pulls/{number}")
        response.raise_for_status()
        r = response.json()
        return PRContext(repo=repo, number=number,
                         head_repo=r["head"]["repo"]["full_name"], head_sha=r["head"]["sha"],
                         base_sha=r["base"]["sha"], head_ref=r["head"]["ref"], base_ref=r["base"]["ref"],
                         title=r["title"], author=r["user"]["login"])

    def get_diff(self, repo: str, number: int) -> str:
        """Accept 头换成 diff 格式,GitHub 直接回 unified diff——零解析成本。"""
        r = self.c.get(f"/repos/{repo}/pulls/{number}",
                       headers={"Accept": "application/vnd.github.diff"})
        r.raise_for_status()
        return r.text

    def get_file(self, repo: str, ref: str, path: str) -> str:
        r = self.c.get(f"/repos/{repo}/contents/{path}", params={"ref": ref})
        if r.status_code == 404:
            return ""
        r.raise_for_status()
        return base64.b64decode(r.json().get("content", "")).decode("utf-8", "replace")

    def create_review(self, repo: str, number: int, event: str,
                      body: str, comments: list[dict], commit_id: str | None = None) -> int:
        """event: COMMENT | REQUEST_CHANGES。comments: [{path, line, side, body}]
        side=RIGHT 表示评论挂在新文件行号上。"""
        r = self.c.post(f"/repos/{repo}/pulls/{number}/reviews", json={
            "event": event, "body": body,
            **({"commit_id": commit_id} if commit_id else {}),
            "comments": [{"path": c["path"], "line": c["line"],
                          "side": "RIGHT", "body": c["body"]} for c in comments]})
        r.raise_for_status()
        review_id = r.json().get("id")
        if not isinstance(review_id, int) or review_id <= 0:
            raise ValueError("GitHub 未返回有效 review ID")
        return review_id
`} />
        <h4>api.py + queue.py:webhook 语义的完整回应</h4>
        <p>GitHub <b>不会自动重试失败投递</b>，需人工或自建巡检重投递。应在 10 秒内返回 2xx；本例先持久接收任务，再返回 202，由 worker 异步处理。同 delivery 的重复请求去重，内部失败按任务状态恢复；API 未接收成功时需显式重投递。</p>
        <CodeFile name="sentinel/queue.py" code={`"""SQLite 持久任务队列：先提交接收记录，再回 202；worker 轮询领取。
状态 pending/running/completed/failed，失败指数退避；进程重启后租约可恢复。
单机教学实现；分布式部署应使用可靠队列与持久卷。
GitHub 发布和本地提交无法跨系统原子化，崩溃边界仍须核对已发布评论。
"""
import json
import logging
import sqlite3
import threading
import time
from pathlib import Path
from uuid import uuid4
from sentinel.observe import Trace
from sentinel.pipeline import review_pr

log = logging.getLogger("sentinel")

class DeliveryStore:
    def __init__(self, path="data/deliveries.sqlite3"):
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.path = path
        with self.connect() as db:
            db.execute("""CREATE TABLE IF NOT EXISTS deliveries(
                id TEXT PRIMARY KEY, payload TEXT NOT NULL, state TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0, ready REAL NOT NULL DEFAULT 0,
                lease REAL NOT NULL DEFAULT 0, owner TEXT)""")

    def connect(self):
        db = sqlite3.connect(self.path, timeout=10)
        db.row_factory = sqlite3.Row
        return db

    def accept(self, delivery, payload):
        with self.connect() as db:
            cursor = db.execute("INSERT OR IGNORE INTO deliveries(id,payload,state) VALUES(?,?,'pending')",
                                (delivery, json.dumps(payload)))
            return cursor.rowcount == 1  # 出 with 后提交；失败抛出，不留下成功去重标记

    def claim(self):
        now, owner = time.time(), uuid4().hex
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("""SELECT * FROM deliveries WHERE
                (state='pending' AND ready<=?) OR (state='running' AND lease<=?)
                ORDER BY ready LIMIT 1""", (now, now)).fetchone()
            if row is None:
                return None
            db.execute("UPDATE deliveries SET state='running',attempts=attempts+1,lease=?,owner=? WHERE id=?",
                       (now + 180, owner, row["id"]))
            return {**dict(row), "owner": owner, "attempts": row["attempts"] + 1}

    def renew(self, task):
        with self.connect() as db:
            db.execute("UPDATE deliveries SET lease=? WHERE id=? AND owner=? AND state='running'",
                       (time.time() + 180, task["id"], task["owner"]))

    def finish(self, task, success):
        state = "completed" if success else "pending" if task["attempts"] < 3 else "failed"
        with self.connect() as db:
            db.execute("UPDATE deliveries SET state=?,ready=?,lease=0,owner=NULL WHERE id=? AND owner=?",
                       (state, time.time() + 2 ** task["attempts"], task["id"], task["owner"]))

    def retry_failed(self, delivery):
        # 人工巡检后显式调用；同 delivery 的重复 POST 不能任意清除失败次数。
        with self.connect() as db:
            db.execute("UPDATE deliveries SET state='pending',attempts=0,ready=0 WHERE id=? AND state='failed'", (delivery,))

    def size(self):
        with self.connect() as db:
            return db.execute("SELECT count(*) FROM deliveries WHERE state IN ('pending','running')").fetchone()[0]

store = DeliveryStore()

def enqueue(delivery: str, payload: dict) -> bool:
    return store.accept(delivery, payload)

def size():
    return store.size()

def _run_one(task):
    payload = json.loads(task["payload"])
    trace = Trace(f"pr-{payload['number']}")
    stop = threading.Event()
    def heartbeat():
        while not stop.wait(30):
            try:
                store.renew(task)
            except Exception:
                log.exception("delivery lease renewal failed")
    thread = threading.Thread(target=heartbeat, daemon=True)
    thread.start()
    success = False
    try:
        review_pr(payload, trace)
        success = True
    except Exception:
        log.exception("review failed; durable task will retry or require operator recovery")
        trace.event("failed")
    finally:
        stop.set()
        thread.join()
        try:
            trace.dump()
        finally:
            store.finish(task, success)

def _worker():
    while True:
        try:
            task = store.claim()
            if task:
                _run_one(task)
            else:
                time.sleep(.5)
        except Exception:
            log.exception("queue worker error")
            time.sleep(1)

def start(n=2):
    for _ in range(n):
        threading.Thread(target=_worker, daemon=True).start()
`} note="网络调用有超时，任务有可续租租约；仍需进程级取消与供应商调用预算。线程 future.result(timeout) 只停止等待，不会终止正在执行的工作。" />
        <CodeFile name="sentinel/api.py" code={`"""验签 → 过滤/校验 → 持久接收 → 202。失败投递须显式重投递。"""
import json
import sqlite3
from contextlib import asynccontextmanager
from uuid import UUID
from fastapi import FastAPI, HTTPException, Request
from sentinel import queue
from sentinel.github import verify_signature

@asynccontextmanager
async def lifespan(app):
    queue.start(2)
    yield

app = FastAPI(title="SENTINEL Code Review Agent", lifespan=lifespan)

@app.post("/webhook", status_code=202)
async def webhook(request: Request):
    body = await request.body()
    if len(body) > 1_000_000:
        raise HTTPException(status_code=413, detail="payload too large")
    if not verify_signature(body, request.headers.get("x-hub-signature-256")):
        raise HTTPException(status_code=401, detail="bad signature")
    if request.headers.get("x-github-event") != "pull_request":
        return {"ok": True, "ignored": "event"}
    try:
        delivery = str(UUID(request.headers.get("x-github-delivery", "")))
        payload = json.loads(body)
        if not isinstance(payload, dict):
            raise ValueError("object required")
        if payload.get("action") not in ("opened", "synchronize"):
            return {"ok": True, "ignored": "action"}
        repo = payload["repository"]["full_name"]
        number = payload["number"]
        if not isinstance(repo, str) or len(repo.split("/")) != 2 or not all(repo.split("/")):
            raise ValueError("invalid repository")
        if type(number) is not int or number <= 0:
            raise ValueError("invalid PR")
    except (KeyError, ValueError, TypeError) as err:
        raise HTTPException(status_code=400, detail="invalid payload or delivery id") from err
    try:
        created = queue.enqueue(delivery, payload)  # 提交失败时不返回接收成功
    except sqlite3.Error as err:
        raise HTTPException(status_code=503, detail="durable intake unavailable; explicit redelivery required") from err
    return {"ok": True, "queued": created, "dedup": not created}

@app.get("/healthz")
def healthz():
    return {"ok": True, "queue_size": queue.size()}
`} note="接收记录和任务是一张持久表；失败不会留下“已完成”标记。配置持久卷，定期检查 failed 状态，并对 GitHub 失败投递执行显式重投递。" />
        <h4>pipeline.py:把所有零件拧成一条流水线</h4>
        <CodeFile name="sentinel/pipeline.py" code={`"""编排:diff → 规则 → LLM 审查 → 自检 → 去重 → 回写。
每一步的失败语义都已在各自模块内定义;这里只管顺序与汇总。"""
from sentinel import rules
from sentinel.config import settings
from sentinel.context import build_context
from sentinel.dedupe import CommentStore, suppress
from sentinel.diff import parse_diff
from sentinel.github import GitHub
from sentinel.models import Severity
from sentinel.reviewer import review
from sentinel.verify import self_check

SEVERITY_RANK = {"low": 0, "medium": 1, "high": 2, "blocker": 3}
COMMENT_TEMPLATE = """**[{severity}] {claim}**

{evidence_quote}

{detail}"""


def review_pr(payload: dict, trace) -> None:
    repo, number = payload["repository"]["full_name"], payload["number"]
    gh = GitHub()
    pr = gh.get_pr(repo, number)
    if pr.author.endswith("[bot]"):        # 别审查别的机器人:防套娃与刷屏
        trace.event("skip", why="bot pr")
        return

    hunks = parse_diff(gh.get_diff(repo, number))
    if not hunks:
        trace.event("skip", why="no added lines")
        return

    # 1) 规则引擎:不调用 LLM，仍需核对误报与漏报
    findings = rules.run_rules(hunks)

    # 2) LLM 审查 + 对抗式自检(上下文足够小才值得花钱)
    summary = ""
    context = build_context(pr, hunks, gh, trace)
    if context:
        draft = review(pr, context, hunks, trace)
        summary = draft.summary
        findings += self_check(draft.findings, context, trace)

    before_suppress = len(findings)
    # 3) 去重与预算
    store = CommentStore()
    findings = suppress(findings, f"{repo}#{number}", store, trace)

    if gh.get_pr(repo, number).head_sha != pr.head_sha:
        raise RuntimeError("PR 已更新，请重跑，当前结果不发布")

    # 4) 回写:高危才 REQUEST_CHANGES,其余 COMMENT
    post = gh.create_review(
        repo, number,
        "REQUEST_CHANGES" if any(f.severity == Severity.blocker for f in findings)
        else "COMMENT",
        summary if findings else ("本轮建议已去重或被数量预算限制；不表示审查通过。"
                                  if before_suppress else "本轮检查未产生可发布建议；请结合人工 review，不能证明无缺陷。"),
        [{"path": f.path, "line": f.line,
          "body": _render(f)} for f in findings], commit_id=pr.head_sha)
    trace.event("posted", review_id=post, findings=len(findings))

    for f in findings:                     # 记忆:发过的都登记,下次不再重复
        from sentinel.dedupe import fingerprint
        store.record(f"{repo}#{number}", fingerprint(f), str(post))


def _render(f) -> str:
    badge = {"blocker": "🔴 BLOCKER", "high": "🟠 HIGH",
             "medium": "🟡 MEDIUM", "low": "⚪ LOW"}[f.severity]
    return f"**{badge} · {f.category}**\\n\\n{f.claim}\\n\\n" \\
           f"> 证据:{f.evidence}\\n\\n{f.suggestion}".rstrip()
`} note="区分无发现、去重、预算抑制与失败；发布绑定 head SHA。跨 GitHub 与本地数据库的崩溃窗口仍需对账，不能宣称 exactly-once。" />
        <h4>回放评测:recall 是算出来的,不是感觉出来的</h4>
        <p>准备一组「<b>埋了已知 bug 的 PR</b>」(真实历史 PR + 人工注入缺陷),离线重放审查流程,统计已知缺陷的召回率。它和 ATLAS 的 golden set、SCOUT 的 rubric 是同一个思想的三种形态:<b>评测集 = 系统的行为宪法</b>。额外的好处:重放不碰 GitHub、不花 GitHub API 配额,调 prompt 可以一天跑几十轮。</p>
        <CodeFile name="evals/golden_prs.yaml + replay.py" code={`# evals/golden_prs.yaml —— 每个 PR 记录 diff 快照与"埋进去"的已知缺陷
prs:
  - id: gp-001
    desc: "支付回调处理:注入了一个未校验金额符号的 bug"
    diff_file: "fixtures/gp-001.diff"
    expected:
      - { path: "payments/callback.py", line: 42, category: correctness }
  - id: gp-002
    desc: "配置加载:注入了硬编码数据库密码"
    diff_file: "fixtures/gp-002.diff"
    expected:
      - { path: "config.py", line: 7, category: security }
  - id: gp-003
    desc: "干净 PR(控制组):不允许有任何 blocker/high 误报"
    diff_file: "fixtures/gp-003.diff"
    expected: []
}

# ------ evals/replay.py(核心逻辑) ------
"""回放评测:离线重放 golden PR,算 recall 与误报。
控制组(gp-003)专测误报:干净 PR 上出现任何 blocker/high 即失败。"""
import pathlib, yaml

from sentinel.diff import parse_diff
from sentinel import rules
from sentinel.reviewer import review
from sentinel.verify import self_check
from sentinel.context import build_context
from sentinel.models import PRContext
from sentinel.observe import Trace

GOLDEN = yaml.safe_load(pathlib.Path("evals/golden_prs.yaml").read_text("utf-8"))["prs"]


def replay_case(case: dict, trace: Trace) -> list:
    diff = pathlib.Path(case["diff_file"]).read_text("utf-8")
    hunks = parse_diff(diff)
    findings = rules.run_rules(hunks)
    pr = PRContext(repo="acme/widget", number=0, head_ref="x", base_ref="main")
    context = build_context(pr, hunks, gh=FakeGH(), trace=trace)
    draft = review(pr, context, hunks, trace)
    return findings + self_check(draft.findings, context, trace)


def run(min_recall: float = 0.9):
    tr = Trace("replay")
    hits = total = false_positives = 0
    for case in GOLDEN:
        got = replay_case(case, tr)
        for exp in case["expected"]:
            total += 1
            hits += any(f.path == exp["path"] and abs(f.line - exp["line"]) <= 3
                        and f.category == exp["category"] for f in got)
        if not case["expected"]:                     # 控制组:只许 low
            false_positives += sum(1 for f in got if f.severity != "low")
    recall = hits / max(1, total)
    print(f"recall {recall:.0%} · 控制组误报 {false_positives}")
    assert recall >= min_recall and false_positives == 0
`} note="line 容差 ±3:LLM 报的行号偶尔落在紧邻行,按「同一处问题」计数——这是评测口径的诚实处理,面试时值得主动说明。" />
      </Mile>

      <Mile id="p3-m6" no="M6" title="部署与成本:让它安静地跑在 CI 里">
        <Kpis items={[
          ['~$0.15', '典型 PR 成本:规则 0 元 + 审查 ~$0.08 + 自检 ~$0.05'],
          ['< 60s', 'webhook → 首评(排队 2s + 组装 5s + LLM 40s + 回写 3s)'],
          ['~2 核 512M', '服务资源:本体很轻,大头是出网带宽和日志'],
          ['×1 台', '单实例起步:队列在进程内,多实例前先换外部队列'],
          ['0 次/周', '静默失败次数:失败必有降级评论或告警——这是硬指标'],
        ]} />
        <ul className="steps">
          <li><b>先装在「最痛的 3 个仓库」灰度</b>:挑 review 积压最严重的团队,周会收集「这周机器人说的哪些有用/哪些烦人」,有效率数据说话。</li>
          <li><b>监控四个数</b>:首评 p95 延迟、单 PR 成本分布、评论有效率(周抽样)、REQUEST_CHANGES 的误伤率(被人工 override 的比例——它是最诚实的质量信号)。</li>
          <li><b>prompt 迭代纪律</b>:改 REVIEW_SYSTEM 前,先跑 replay 评测;评测不过,代码不许合并——和 ATLAS 的 CI 三连一脉相承。</li>
          <li><b>安全例行</b>:GitHub token 定期轮换;webhook secret 入 KMS;机器人评论模板变更走代码评审(对,机器人自己的 prompt 也要被人 review)。</li>
        </ul>
        <div className="card tip">
          <span className="card-tag">✔ 进阶方向</span>
          <ul style={{ margin: '4px 0 0' }}>
            <li><b>auto-fix 分支</b>:对有明确 suggestion 的 finding,机器人开 fix/ 分支提 PR——写权限依然不给它直推主分支的资格。</li>
            <li><b>代码库索引</b>:全仓库向量化(Greptile 路线),让审查能看到「这个函数在别处怎么被调用」——上下文工程的下一层。</li>
            <li><b>团队风格学习</b>:人工 reviewer 的历史评论提炼成团队偏好,注入 CONVENTIONS——记忆系统(CH.09)的又一次落地。</li>
            <li><b>增量审查加速</b>:synchronize 事件只解析新增 commit 的 diff 区间,重审成本再降一半。</li>
          </ul>
        </div>
      </Mile>

      <Mile id="p3-res" no="END" title="简历与面试:把「工程完成度」讲出来">
        <Res>
          <ul style={{ margin: '4px 0 0' }}>
            <li><b>项目名:</b>SENTINEL——接入 CI 的代码审查 Agent(GitHub App 形态)</li>
            <li><b>一句话:</b>webhook 驱动的双引擎审查系统:确定性规则抓安全事故,LLM 抓逻辑缺陷,三道防线保住评论信噪比。</li>
            <li><b>bullet 1:</b>设计「规则先跑 + LLM 兜底」双引擎与对抗式自检(独立质疑者复查),在 [样本量] 个回放 PR 上测得召回 [实测值]、精度 [实测值]，另报告干净 PR 控制组误报率。</li>
            <li><b>bullet 2:</b>实现 diff 行号校验、指纹去重、评论预算与已解决线程抑制,在 [人工复核样本] 上评论有效率 [实测值];针对 PR 内容的提示注入,落地数据/指令分离与行号身份证两层防御。</li>
            <li><b>bullet 3:</b>完成 webhook 幂等、异步队列与超时降级；在 [PR 样本/模型配置] 上测得单 PR 成本 [实测值]、首评延迟 p95 [实测值]。</li>
          </ul>
        </Res>
        <h4>面试深挖题</h4>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th style={{ width: '38%' }}>面试官会问</th><th>你的回答要点</th></tr></thead>
            <tbody>
              <tr><td><b>评论信噪比怎么持续保证?</b></td><td>先讲三道防线(severity 门槛/指纹去重+已解决抑制/预算),再讲反馈闭环:每周抽样标「有效/无效」,无效样本进 replay 集,使评测集本身反映「用户觉得烦的是什么」。信噪比不是上线时的指标,是运营出来的指标。</td></tr>
              <tr><td><b>diff 里的提示注入,你的防线是什么?</b></td><td>消息/标记区分不可信输入(提示层缓解，不是物理隔离)+ 合法 diff 行号校验(只保证位置，不证明结论真实)+ 证据核对与最小权限；攻击仍可能诱导挂在合法行号上的虚假 finding。再举真实案例 CVE-2025-53773 说明威胁不是理论,最后承认没有银弹、只有纵深。</td></tr>
              <tr><td><b>行号校验能防注入吗?模型能编合法行号吗?</b></td><td>模型能选择合法行号，因此该检查只排除不存在的位置。结论还需原文证据、对抗评测和人工抽检；权限与发布闸门限制错误意见的实际影响，不能把位置校验当成真实性证明。</td></tr>
              <tr><td><b>和 CodeRabbit/Greptile 比你的差异?</b></td><td>不回避商业差距(代码库索引、规则库成熟度),讲清架构同构(它们的工程博客公开了相同的三道防线思路)与自建价值:内网仓库、合规要求、成本与定制的控制权。能客观比较工具,比吹自己的更可信。</td></tr>
              <tr><td><b>误报和漏报,你保哪个?</b></td><td>分场景:blocker 级(密钥)规则只对定义的模式提供可重复检查，精度/召回和阻断误伤率必须实测;LLM 层明确「漏报好过误报」并给理由——审查工具的信任是单向门,砸了重建成本极高。顺带讲 REQUEST_CHANGES 的误伤率监控,说明这个取舍是可度量、可回调的。</td></tr>
            </tbody>
          </table>
        </div>
        <div className="card boss">
          <span className="card-tag">🏆 全手册毕业</span>
          <p style={{ margin: 0 }}>
            打完三个项目,你已经完成了这本手册的闭环:<b>ATLAS 教你把 Agent 做稳,SCOUT 教你把 Agent 做大,SENTINEL 教你把 Agent 装进真实世界的流水线。</b>
            三份 trace、三套评测集、三个可以现场深挖的架构故事——去把它写上简历,然后在面试里,把这本手册的每一章讲成你自己的经验。
          </p>
        </div>
        <LabFoot lab={lab} onGo={onGo} keys={['p1', 'p2', 'p3']} />
      </Mile>
    </>
  )
}
