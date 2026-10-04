// 探测 ar5iv HTML 结构:找论文图与图片 URL
const id = '2210.03629'; // ReAct
const res = await fetch(`https://ar5iv.labs.arxiv.org/html/${id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
console.log('status:', res.status);
const html = await res.text();
console.log('html length:', html.length);
// 找 figure 块
const figs = [...html.matchAll(/<figure[^>]*class="[^"]*ltx_figure[^"]*"[^>]*>/g)];
console.log('figure blocks:', figs.length);
// 找图片
const imgs = [...html.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)].map((m) => m[1]);
console.log('img count:', imgs.length);
console.log(imgs.slice(0, 15).join('\n'));
// 找图题
const caps = [...html.matchAll(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g)].map((m) =>
  m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120),
);
console.log('\ncaptions:');
caps.slice(0, 8).forEach((c, i) => console.log(`[${i}]`, c));
