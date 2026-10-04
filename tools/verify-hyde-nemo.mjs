const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
(async () => {
  for (const q of ['all:%22NeMo Guardrails%22 AND ti:%22Guardrails%22', 'ti:%22Precise Zero-Shot Dense Retrieval without Relevance Labels%22']) {
    const x = await (await fetch(`http://export.arxiv.org/api/query?search_query=${q}&max_results=3`)).text();
    for (const e of x.split('<entry>').slice(1)) {
      const id = (e.match(/abs\/([^<]+)<\/id>/) || [])[1];
      const title = clean(e.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
      const pub = clean(e.match(/<published>(.*?)<\/published>/)?.[1])?.slice(0, 10);
      console.log(`${id} | ${pub} | ${title.slice(0, 100)}`);
    }
    console.log('---');
    await sleep(1300);
  }
})();
