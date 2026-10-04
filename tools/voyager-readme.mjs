(async () => {
  const res = await fetch('https://api.github.com/repos/MineDojo/Voyager/readme', {
    headers: { 'User-Agent': 'x', Accept: 'application/vnd.github.raw' },
  });
  const md = await res.text();
  console.log('readme len:', md.length);
  const imgs = [...md.matchAll(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)].map((m) => m[1]);
  console.log('images:');
  imgs.slice(0, 10).forEach((u) => console.log(' ', u.slice(0, 130)));
})();
