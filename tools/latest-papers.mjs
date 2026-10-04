// 实时检索 arXiv 最新 agent 论文(按提交日期倒序),供覆盖度检查
const QUERIES = [
  { tag: 'cs.MA 最新', q: 'cat:cs.MA AND (all:agent OR all:agents)', n: 40 },
  { tag: '最新 agent harness', q: 'all:"agent harness" OR all:"scaffolding" AND cat:cs.AI', n: 20 },
  { tag: '最新 agent memory', q: 'all:"agent memory" OR all:"memory for LLM agents"', n: 20 },
  { tag: '最新 self-evolving', q: 'all:"self-evolving" AND all:agent', n: 15 },
  { tag: '最新 computer use', q: 'all:"computer use" AND all:agent AND cat:cs.AI', n: 15 },
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
(async () => {
  for (const { tag, q, n } of QUERIES) {
    const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(q).replace(/%20/g, '+')}&sortBy=submittedDate&sortOrder=descending&max_results=${n}`;
    try {
      const xml = await (await fetch(url)).text();
      const entries = xml.split('<entry>').slice(1);
      console.log(`\n===== ${tag}(${entries.length} 条) =====`);
      for (const e of entries) {
        const id = (e.match(/abs\/([^<]+)<\/id>/) || [])[1]?.replace(/v\d+$/, '');
        const title = clean(e.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
        const pub = clean(e.match(/<published>(.*?)<\/published>/)?.[1])?.slice(0, 7);
        console.log(`${id} | ${pub} | ${title.slice(0, 100)}`);
      }
    } catch (e) { console.log(`${tag} ERR ${e.message}`); }
    await sleep(1500);
  }
})();
