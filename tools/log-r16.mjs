// R16: 追加 WORKLOG 记录(避免多行内联 node -e 的 Windows 转义问题)
import { appendFileSync } from 'node:fs'

const entry = `
### R16 aieng-zh.cn 全量对标补录 + 图解残缺双端细查(与并行会话 R15 互补)
方法:webReader 抓取 aieng-zh.cn/catalog.html 拿到全部 20 阶段 523 课课表;gap-scan.mjs 对 69 项候选主题做正则扫描(41 项未覆盖);筛除超纲项(MARL/蚁群/FIPA 史话/差分隐私等)后补录;视觉复查=程序化 SVG text 两两矩形重叠检测 + 有效字号(字体 px×缩放比)+ 双端逐图截图目检。

**内容补录(对标 523 课后评估出的必要项)**
- 论文 81→85:CRITIC 2305.11738 / Sleep-time Compute 2504.13171 / Multiagent Debate 2305.14325 / AlphaEvolve 2506.13131,arXiv 标题逐一核验 0 失败,NOTES 各补中文导读,resource-summary 同步(全站计数 85/68/3 一致)
- 章节增补 10 处:CH08 持久化执行(durable execution,Temporal/Restate);CH09 Letta 记忆块+休眠时计算;CH11 CRITIC(工具校验式自纠错);CH12 新增 12.5「集体智慧与集体翻车」(辩论/自洽性辨析/群体思维·单一栽培·级联错误×MAST);CH15 古德哈特定律(judge-gaming/奖励作弊/基准泄漏);CH16 EchoLeak(CVE-2025-32711)实例+自动化红队(PAIR/many-shot/Garak/PyRIT)+Claude Code 权限模式分级;CH17 AI 网关+语义缓存+灰度影子流量+季度故障演练;CH19 AlphaEvolve+可扩展监督/AI 控制雷达行;Roadmap「六个工程判断力」卡(范围契约/隔离委派/反馈棘轮等)

**图解修复(并行会话 R15 漏网,本轮抓到)**
- [x] FIG.00 公式图:游离等号画在 x=386 恰为「循环」盒正中,压住 emoji 与文字(双端同现)→ 删除游离等号;「+」从盒边(x+146)移到间隙中心(x+134);结论条改「= 🤖 AGENT」承接公式语义
- [x] FIG.01 循环图:「ACTION → OBSERVATION 循环体」标签被虚线框底边横穿 → viewBox 314→330,标签 y 308→316
- [x] .card-tag inline-block→block+fit-content:消除「标签与正文同排」不一致(CH02 2.3 第三卡/论文页使用说明/兵器谱收录标准/路线图总原则此前均同排,现标签恒占一行)

**回归验证**
- 5 视图 8 图 text-pair 重叠 0;全 21 图双端 minFont 10.2-13.3px、无裁切;页面横向溢出 0;ch08 表格 .tbl-wrap 内部横滚正常(330 视口容 510 内容);移动抽屉开合/滚动锁正常
- build 984ms 通过;桌面 1440+移动 390 逐图截图复核通过
- 环境备注:IAB 后台面板 rAF 节流致 App 锚点滚动延迟执行,程序化截图须 scroll→verify(scrollY)→shot 三步,verify 不符即重试(前台真实用户不受影响)
`

appendFileSync('WORKLOG.md', '\n' + entry)
console.log('WORKLOG R16 appended, chars=' + entry.length)
