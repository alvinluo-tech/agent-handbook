// 按标题检索 arXiv ID(扩充 2026 新论文)
const queries = [
  'From Question Answering to Task Completion: A Survey on Agent System and Harness Design',
  'Towards a science of scaling agent systems',
  'Anatomy, Architecture, and Evolution of Coding Agents',
  'State of Agent Engineering',
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  for (const q of queries) {
    const url = `http://export.arxiv.org/api/query?search_query=ti:%22${encodeURIComponent(q).replace(/%20/g, '+').replace(/%3A/g, '')}%22&max_results=3`;
    try {
      const xml = await (await fetch(url)).text();
      const entries = xml.split('<entry>').slice(1);
      console.log(`\n== ${q}`);
      if (!entries.length) console.log('  (no result)');
      for (const e of entries) {
        const id = (e.match(/<id>http:\/\/arxiv.org\/abs\/([^<]+)<\/id>/) || [])[1];
        const title = (e.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.replace(/\s+/g, ' ').trim();
        const pub = (e.match(/<published>(.*?)<\/published>/) || [])[1];
        console.log(`  ${id} | ${pub?.slice(0, 10)} | ${title}`);
      }
    } catch (e) { console.log('  ERR', e.message); }
    await sleep(1200);
  }
})();
