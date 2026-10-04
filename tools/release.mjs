#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

/**
 * 自动化发版管理 CLI 脚本
 * 用法:
 *   node tools/release.mjs <patch|minor|major|x.y.z> "<title>" "<summary>" "[change1, change2...]"
 * 示例:
 *   node tools/release.mjs minor "发布全新多模态实战工坊" "新增多模态工业质检教学项目"
 */

const [,, typeOrVersion, title, summary, rawChanges] = process.argv

if (!typeOrVersion) {
  console.log(`
使用方式:
  node tools/release.mjs <patch | minor | major | x.y.z> "<release-title>" "<summary>" [changes-json]

示例:
  node tools/release.mjs patch "修复模型引用与文字勘误" "修正 CH.02 最新模型命名"
`)
  process.exit(1)
}

// 1. 读取当前版本
const pkgPath = 'package.json'
const versionPath = 'src/data/version.json'

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const versionData = JSON.parse(readFileSync(versionPath, 'utf8'))
const currentVer = pkg.version || versionData.version || '1.1.0'

const [major, minor, patch] = currentVer.replace(/^v/, '').split('.').map(Number)

let nextVer = ''
if (typeOrVersion === 'patch') {
  nextVer = `${major}.${minor}.${patch + 1}`
} else if (typeOrVersion === 'minor') {
  nextVer = `${major}.${minor + 1}.0`
} else if (typeOrVersion === 'major') {
  nextVer = `${major + 1}.0.0`
} else if (/^\d+\.\d+\.\d+$/.test(typeOrVersion.replace(/^v/, ''))) {
  nextVer = typeOrVersion.replace(/^v/, '')
} else {
  console.error(`❌ 无效的版本类型或版本号: "${typeOrVersion}"`)
  process.exit(1)
}

const today = new Date().toISOString().split('T')[0]
const formattedVer = `v${nextVer}`

console.log(`\n🚀 准备发布新版本: ${currentVer} → ${formattedVer}`)

// 2. 解析变更列表
let changes = []
if (rawChanges) {
  try {
    changes = JSON.parse(rawChanges)
  } catch {
    changes = rawChanges.split(';').map(s => s.trim()).filter(Boolean)
  }
}
if (changes.length === 0) {
  changes = [summary || title || `版本 ${formattedVer} 发布`]
}

// 3. 更新 package.json
pkg.version = nextVer
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
console.log(`✔ 已更新 package.json: version = "${nextVer}"`)

// 4. 更新 src/data/version.json
// 将此前的 LATEST 标修改为 STABLE
versionData.releases.forEach(r => {
  if (r.tag === 'LATEST') r.tag = 'STABLE'
})

const newRelease = {
  version: formattedVer,
  date: today,
  type: typeOrVersion.startsWith('v') || !['major', 'minor', 'patch'].includes(typeOrVersion) ? 'minor' : typeOrVersion,
  title: title || `版本 ${formattedVer} 发布`,
  tag: 'LATEST',
  summary: summary || title || `版本 ${formattedVer} 包含多项优化与内容更新`,
  changes
}

versionData.version = nextVer
versionData.releaseDate = today
versionData.snapshotDate = today
versionData.releases.unshift(newRelease)

writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + '\n', 'utf8')
console.log(`✔ 已更新 src/data/version.json: 当前版本 ${formattedVer}`)

// 5. 写入 WORKLOG.md
try {
  const worklogPath = 'WORKLOG.md'
  const worklog = readFileSync(worklogPath, 'utf8')
  const logEntry = `
### Release ${formattedVer} (${today})
- **发布标题**: ${newRelease.title}
- **核心摘要**: ${newRelease.summary}
- **变更详情**:
${changes.map(c => `  - ${c}`).join('\n')}
`
  writeFileSync(worklogPath, worklog.trim() + '\n' + logEntry, 'utf8')
  console.log(`✔ 已向 WORKLOG.md 追加发布记录`)
} catch (e) {
  console.warn(`⚠ 追加 WORKLOG.md 失败:`, e.message)
}

// 6. 执行全套数据与构建门禁
console.log('\n🔍 运行自动化发布前质量门禁...')
try {
  execSync('node tools/sync-resource-summary.mjs', { stdio: 'inherit' })
  execSync('node tools/check-data.mjs', { stdio: 'inherit' })
  execSync('node tools/audit-cited-diff.mjs', { stdio: 'inherit' })
  execSync('node tools/final-check.mjs', { stdio: 'inherit' })
  console.log(`\n🎉 版本 ${formattedVer} 发布与审计全部完成！可直接提交 git commit & tag！`)
} catch {
  console.error('\n❌ 质量门禁未通过，请检查上述错误后重试。')
  process.exit(1)
}
