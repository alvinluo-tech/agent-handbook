const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
(async () => {
  const queries = [
    'all:%22TaskMatrix.AI%22',
    'all:%22GuardAgent%22',
  ];
  for (const q of queries) {
    const u = `http://export.arxiv.org/api/query?search_query=${q}&max_results=6`;
    const x = await (await fetch(u)).text();
    for (const e of x.split('<entry>').slice(1)) {
      const id = (e.match(/abs\/([^<]+)<\/id>/) || [])[1];
      const ti = clean(e.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
      console.log(`${id} | ${ti.slice(0, 105)}`);
    }
    console.log('---');
    await sleep(1300);
  }
})();
