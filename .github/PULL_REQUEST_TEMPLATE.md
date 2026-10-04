## PR 类型 (Type of Change)

请勾选本次 PR 涉及的变更类型：

- [ ] `feat`: 新增章节 / 新增实战项目 / 重磅功能升级
- [ ] `fix`: 样式错位修复 / 移动端横向溢出修复 / 交互逻辑修复
- [ ] `docs`: 纯文档更新（README, CONTRIBUTING, 学习指南补充）
- [ ] `paper`: 新增或补充论文元数据与导读
- [ ] `project`: 新增或更新 GitHub 兵器谱开源项目
- [ ] `errata`: 章节学术或工程概念勘误 / 模型版本时效性修正
- [ ] `chore`: 依赖更新 / 构建与维护脚本优化

---

## 变更描述 (Description)

请简要描述本次 PR 解决的问题、引入的内容或优化的细节：

<!-- 在此输入你的描述 -->

---

## 关联 Issue (Related Issue)

Closes #<!-- 输入关联的 Issue 编号，若无请留空 -->

---

## 质量自查清单 (Checklist)

提交 PR 前，请确认已在本地执行并通过以下检查项：

- [ ] 提交信息符合 Conventional Commits 规范（如 `feat:`, `fix:`, `docs:`, `paper:` 等）
- [ ] 本地运行 `node tools/check-data.mjs` 通过（数据格式合法）
- [ ] 本地运行 `node tools/audit-cited-diff.mjs` 通过（正文引用无孤立项）
- [ ] 本地运行 `node tools/final-check.mjs` 显示 `ALL SYSTEMS GO ★`
- [ ] 本地运行 `npm run build` 成功完成无致命警告
- [ ] 若新增论文，已在 `src/data/papers.json` 中配置完整元数据并验证可下载
- [ ] 若涉及样式或排版变动，已在桌面端（>=1200px）与移动端（<=390px）核对无横向溢出
