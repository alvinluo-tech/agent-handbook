// 探测 2026 新项目的 GitHub 仓库名(OpenClaw/DSH/Pi 系/Hermes)
const candidates = [
  'openclaw/openclaw', 'openclawai/openclaw', 'OpenClaw/OpenClaw',
  'NousResearch/hermes-agent',
  'can1357/oh-my-pi',
  'badlogic/pi-mono',
  'deepseek-ai/dsh', 'DeepSeek/dsh', 'deepseek-ai/DeepSeek-Harness',
  'cordis-ai/cordis',
];
const UA = { 'User-Agent': 'agent-dev-guide-handbook', Accept: 'application/vnd.github+json' };
(async () => {
  for (const slug of candidates) {
    try {
      const res = await fetch(`https://api.github.com/repos/${slug}`, { headers: UA });
      if (res.ok) {
        const j = await res.json();
        console.log(`OK  ${slug}: ⭐${j.stargazers_count} pushed ${(j.pushed_at || '').slice(0, 10)} | ${j.description || ''}`.slice(0, 160));
      } else {
        console.log(`--  ${slug}: HTTP ${res.status}`);
      }
    } catch (e) { console.log(`ERR ${slug}: ${e.message}`); }
    await new Promise((r) => setTimeout(r, 300));
  }
})();
