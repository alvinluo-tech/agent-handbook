import { readFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'WORKLOG.md');
const t = readFileSync(p, 'utf8');
if (t.includes('### R15 全站视觉双端复查')) {
  console.log('R15 already present');
} else {
  const entry = `
### R15 全站视觉双端复查(用户驱动:此前检查粗糙,要求逐图细查)
方法:document.fonts 实测字体覆盖;桌面 1440 进入全文模式对 21 张图逐张截图细查;工坊 8 张 labs 图逐张;移动 390px 全页面横向溢出程序化检测(9 个视图)。

**发现与修复**
- [x] 【重大·桌面】全部 21 张图解在桌面端被强制 960px 最小宽裁切+横向滚动(并行会话为移动端加的 .figure-scroll svg{min-width:960px} 对桌面也生效)——修复:figfix.css 隔离文件(桌面 100% 完整缩放,≤880px 保持 960px 横滚,全屏 1200px)。采用隔离文件因 styles.css 被并行整文件覆写两次吞掉补丁
- [x] FIG.02:两枚轴标签(y=310)压在「单次 LLM 调用」盒上 → 下移至 y=338 并扩展 viewBox 340→352
- [x] FIG.07:「MemGPT 隐喻」说明文字压住上下文窗口盒底边 → y 250→262
- [x] FIG.08:「LLM 生成答案」深盒与上方检索盒重叠(视觉检查粗糙漏网)→ 盒体 y 292→312、箭头/结论行同步下移,viewBox 380→398
- [x] 【移动·lab-p3】document.scrollWidth 469>390 横向溢出:元凶为 .code > .code-note 长注释不换行 → 补 min-width:0/overflow-wrap:anywhere;修复后 9 个视图(lab-p1/p2/p3/papers/projects/roadmap/glossary/ch03/ch10)scrollWidth 全部 376≤390
- [x] 字体实证:document.fonts.check 确认 Fusion Pixel 真实覆盖 CJK(标题确为像素字形)、Press Start 2P 已加载

**结论**:桌面与移动端 21+8 张图解、9 类页面双端无重叠/无溢出/无字体回退;两处图内容更新由并行会话完成(FIG.05 规范 2026-07-28 注记、FIG.10 双排时间线含 2026 事件),本轮视觉复核通过。
`;
  appendFileSync(p, entry);
  console.log('R15 appended');
}
