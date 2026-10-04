// 追加 WORKLOG R16
import { readFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'WORKLOG.md');
const t = readFileSync(p, 'utf8');
if (t.includes('### R16 论文原著图提取')) {
  console.log('R16 already present');
} else {
  const entry = `
### R16 论文原著图提取与嵌入(用户驱动:深入论文,取原图入册,标注来源)
方法:ar5iv(arXiv 官方 HTML 化项目)抓取论文 HTML,解析 figure 块提取**矢量原图(SVG)或位图原图(PNG)**,失败时回退 arxiv.org 官方 HTML / 官方仓库高清资产;逐图人工目检内容正确性。

**管线**(tools/extract-paper-figures.mjs v2/v3 + dl-mcp-audit.mjs):
- figcaption 前缀/包含双正则匹配(兼容 "Figure 1 :" 的 nbsp 变体)
- 嵌套子图的标签平衡回溯(2504 的 Figure 1 含双子图,非贪婪块匹配会错位)
- 资产源自动回退:ar5iv → arxiv.org/html → 官方仓库(Voyager 的 pull.png 1.5MB 高清)

**收录 9 张原著图**(8 个章节开篇自动注入,全部带「PAPER FIGURE · 原著图」徽章 + arXiv 链接 + 原文图注 + 中文导读 + 来源标注):
1. CH.03 ReAct Fig.1(SVG):四种提示方式轨迹对比
2. CH.04 Lost in the Middle Fig.1(SVG):U 型曲线
3. CH.05 Toolformer Fig.1(SVG):自监督工具采样
4. CH.06 MCP Safety Audit Fig.1(a)(PNG):Claude 拒绝 MCE 攻击截图
5. CH.09 MemGPT Fig.1(PNG):记忆压力下的自主写入
6. CH.10 Search-R1 Fig.1(SVG):RL 搜索框架
7. CH.12 Generative Agents(场景图)
8. CH.14 SWE-agent Fig.1(PNG):ACI 总览
9. CH.19 Voyager Fig.2(PNG,官方仓库高清):三件套总览

**过程问题与解决**:ar5iv 资产 503/404 间歇失败 → 双源回退 + 重试;Voyager/SWE-agent 图注 "Figure 1 :" 含 nbsp → 正则容错;嵌套子图 → 平衡回溯;styles.css 写战 → figfix/追加式隔离。
`;
  appendFileSync(p, entry);
  console.log('R16 appended');
}
