from pathlib import Path
import re

def encoded(code):
    return code.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
def put(file, name, code):
    p=Path(f'src/chapters/labs/{file}.jsx');s=p.read_text(encoding='utf8')
    pattern = r'(<CodeFile name="'+re.escape(name)+r'" code=\{`)((?:\\[\s\S]|[^`\\])*)(`\})'
    s,n=re.subn(pattern,lambda m:m[1]+encoded(code)+m[3],s)
    assert n==1, (file,name,n)
    p.write_text(s,encoding='utf8')

auth='''"""认证边界：服务端验证签名、issuer、audience、有效期，再提供业务身份。
环境变量：ATLAS_JWKS_URL、ATLAS_ISSUER、ATLAS_AUDIENCE。
仅支持配置的 RS256 签名；不接受客户端自己声明 user_id/tenant_id。
此示例面向 Bearer API；浏览器 Cookie 会话另需 CSRF 防护。
"""
import os
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, ConfigDict, Field

class Principal(BaseModel):
    model_config = ConfigDict(frozen=True)
    user_id: str = Field(min_length=1, max_length=128)
    tenant_id: str = Field(min_length=1, max_length=128)

bearer = HTTPBearer(auto_error=False)
jwks = jwt.PyJWKClient(os.environ["ATLAS_JWKS_URL"])

def get_principal(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> Principal:
    if credentials is None:
        raise HTTPException(status_code=401, detail="authentication required")
    try:
        key = jwks.get_signing_key_from_jwt(credentials.credentials)
        claims = jwt.decode(credentials.credentials, key.key, algorithms=["RS256"],
                            issuer=os.environ["ATLAS_ISSUER"], audience=os.environ["ATLAS_AUDIENCE"],
                            options={"require": ["sub", "tenant_id", "exp", "iss", "aud"]})
        return Principal(user_id=claims["sub"], tenant_id=claims["tenant_id"])
    except (jwt.PyJWTError, ValueError, TypeError) as err:
        raise HTTPException(status_code=401, detail="invalid credential") from err
'''
p=Path('src/chapters/labs/p1c.jsx');s=p.read_text(encoding='utf8')
marker='        <CodeFile name="atlas/api.py"'
assert marker in s
s=s.replace(marker,'        <CodeFile name="atlas/auth.py" code={`'+encoded(auth)+'`} note="依赖 PyJWT[crypto]；配置可信 IdP 的 JWKS、issuer 与 audience，使用自己的测试租户验证签名、过期和跨用户拒绝。" />\n'+marker)
# 会话表需要部署前显式迁移；业务订单表须存在对应归属字段。
marker='        <CodeFile name="atlas/auth.py"'
schema='''-- 前置迁移；订单表须有 tenant_id、user_id 归属字段并纳入索引。
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY, tenant_id TEXT NOT NULL, user_id TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_owner ON sessions(tenant_id, user_id);
-- messages.session_id 与 sessions.id 保持一致；由业务迁移建立外键。
'''
s=s.replace(marker,'        <CodeFile name="migrations/session-ownership.sql" code={`'+encoded(schema)+'`} kind="前置迁移" />\n'+marker)
p.write_text(s,encoding='utf8')

queue='''"""SQLite 持久任务队列：先提交接收记录，再回 202；worker 轮询领取。
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
'''
put('p3c','sentinel/queue.py',queue)
api='''"""验签 → 过滤/校验 → 持久接收 → 202。失败投递须显式重投递。"""
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
'''
put('p3c','sentinel/api.py',api)

# 正文同步，避免仍把旧版本的限制与承诺写成事实。
changes={
'p1a': [('每个会话的"刹车"','单任务的软阈值；会话累计限额另需持久账本'),('单会话 token 上限','单消息任务 token 软阈值'),('单会话成本上限(美元)','单消息任务成本软阈值(美元)'),('pg_dsn: str = "postgres://atlas:atlas@localhost:5432/atlas"','pg_dsn: str  # 通过 ATLAS_PG_DSN 配置，禁止在代码内保存凭据')],
'p1b': [('下面是完整的路由分发与两条重支路。','下面是路由分发与两条重支路的核心片段；依赖前置模块、业务认证与数据库迁移。'),('工具循环每一步都检查预算','所有收费调用前都检查任务软阈值'),('它写在循环体内','它写在统一网关；单次调用及并发仍可能越过软阈值，严格限额需预留输入/输出额度和持久会话账本')],
'p1c': [('它是整个系统防幻觉的最后闸门','它检测摘录与编号的一致性，事实支持率仍需内容评测'),('1. 结构断言(免费)','1. 结构断言(无模型费用)'),('先筛掉一半','先检查契约')],
'p2c': [('孤儿引用的 lambda 里用 trace.event(...) or 空串 是取巧写法(event 返回 None)——生产请写成普通函数,可读性优先。','摘要与正文均保留未核验引用及标记；来源可达不等于摘录真实或支持结论。仅 HEAD 检查的局限是显式的。')],
'p3a': [('webhook + 进程内轻队列 + 幂等','webhook + SQLite 持久任务队列 + 幂等'),('实时性是产品价值;GitHub webhook 语义是 at-least-once 投递,不幂等就会重复审查重复评论','失败投递不会由 GitHub 自动重试；人工/巡检任务显式重投递，delivery ID 用于接收去重'),('队列是进程内的,重启丢任务——量级上来换 Redis Stream,接口不变','SQLite 单机教学实现；持久卷、任务租约与失败巡检必需，分布式部署换可靠队列'),('repo/number/head_ref/base_ref','repo/number/head_repo/head_sha/base_sha/head_ref/base_ref'),('唯一"总是发布"的内容','按实际检查状态发布，不能把无评论当成通过')],
'p3c': [('GitHub webhook 的投递语义是 <b>at-least-once</b>:网络抖动时它会重发同一事件。不幂等的服务会重复审查、重复评论——所以 delivery id 去重不是「优化」,是接 webhook 的入场券。另一个纪律:<b>webhook 必须立刻 202 返回</b>,审查在后台队列异步跑——GitHub 对 webhook 有 10 秒超时,同步干活会被标记失败然后重发,雪球越滚越大。','GitHub <b>不会自动重试失败投递</b>，需人工或自建巡检重投递。应在 10 秒内返回 2xx；本例先持久接收任务，再返回 202，由 worker 异步处理。同 delivery 的重复请求去重，内部失败按任务状态恢复；API 未接收成功时需显式重投递。'),('store.seen/_deliveries 是复用 CommentStore 的一个约定:任何「只需记住见过与否」的场合都能这么用;生产建议拆成独立的 DeliveryLog。','接收记录和任务是一张持久表；失败不会留下“已完成”标记。配置持久卷，定期检查 failed 状态，并对 GitHub 失败投递执行显式重投递。'),('超时熔断:生产用线程池 future.result(timeout) 或直接上 asyncio + wait_for;此处为保持主线清晰从简,面试可主动提这一层。','网络调用有超时，任务有可续租租约；仍需进程级取消与供应商调用预算。线程 future.result(timeout) 只停止等待，不会终止正在执行的工作。'),('draft.summary 在 findings 为空时也有用——「审查通过」同样是有价值的反馈,让团队知道机器人活着且没意见,而不是挂了。','区分无发现、去重、预算抑制与失败；发布绑定 head SHA。跨 GitHub 与本地数据库的崩溃窗口仍需对账，不能宣称 exactly-once。')],
}
for file,pairs in changes.items():
    p=Path(f'src/chapters/labs/{file}.jsx');s=p.read_text(encoding='utf8')
    for old,new in pairs:
        # 部分文字在模板中，普通引号无须额外转义。
        if old not in s: print('TEXT NOT FOUND', file, old[:50])
        s=s.replace(old,new)
    p.write_text(s,encoding='utf8')
