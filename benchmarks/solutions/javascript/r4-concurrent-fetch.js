const urls = [
  "https://httpbin.org/get",
  "https://httpbin.org/status/404",
  "https://httpbin.org/delay/1",
  "https://httpbin.org/bytes/1024",
  "https://invalid.example.test",
];

async function fetchWithLimit(urls, limit) {
  const results = [];
  const executing = new Set();

  for (const url of urls) {
    const p = (async () => {
      try {
        const resp = await fetch(url);
        const bytes = (await resp.arrayBuffer()).byteLength;
        return `${url}: ${resp.status} (${bytes} bytes)`;
      } catch (e) {
        return `${url}: error: ${e.message}`;
      }
    })();

    executing.add(p);
    p.then(() => executing.delete(p));
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
    results.push(p);
  }

  return Promise.all(results);
}

const results = await fetchWithLimit(urls, 4);
results.forEach((r) => console.log(r));
