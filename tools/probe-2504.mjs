const UA = { 'User-Agent': 'Mozilla/5.0' };
const clean = (s) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
(async () => {
  const html = await (await fetch('https://ar5iv.labs.arxiv.org/html/2504.03767', { headers: UA })).text();
  console.log('len', html.length);
  const caps = [...html.matchAll(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g)].map((m) => clean(m[1]).slice(0, 100));
  caps.slice(0, 10).forEach((c, i) => console.log(`[${i}]`, c));
  // 也找 "Figure 1" 出现处上下文
  const i = html.search(/Figure\s*1/);
  if (i >= 0) console.log('Figure-1 ctx:', JSON.stringify(clean(html.slice(i - 60, i + 90)).slice(0, 140)));
  else console.log('no "Figure 1" text at all');
})();
