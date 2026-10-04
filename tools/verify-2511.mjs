const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
(async () => {
  const xml = await (await fetch('http://export.arxiv.org/api/query?id_list=2511.15759')).text();
  for (const e of xml.split('<entry>').slice(1)) {
    const id = (e.match(/abs\/([^<]+)<\/id>/) || [])[1];
    const title = clean(e.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
    const pub = clean(e.match(/<published>(.*?)<\/published>/)?.[1]);
    const authors = [...e.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((a) => clean(a[1])).slice(0, 5);
    console.log(id, '|', pub?.slice(0, 10), '|', title);
    console.log('authors:', authors.join(', '));
  }
})();
