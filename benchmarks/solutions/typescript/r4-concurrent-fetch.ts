const urls = [
  "https://httpbin.org/get",
  "https://httpbin.org/status/404",
  "https://httpbin.org/delay/1",
  "https://httpbin.org/bytes/1024",
  "https://invalid.example.test",
];

async function fetchUrl(url: string): Promise<string> {
  try {
    const resp = await fetch(url);
    const body = await resp.arrayBuffer();
    return `${url}: ${resp.status} (${body.byteLength} bytes)`;
  } catch (e: any) {
    return `${url}: error: ${e.message}`;
  }
}

async function main() {
  const results: string[] = [];
  for (let i = 0; i < urls.length; i += 4) {
    const batch = urls.slice(i, i + 4).map(fetchUrl);
    results.push(...(await Promise.all(batch)));
  }
  results.forEach((r) => console.log(r));
}

main();
