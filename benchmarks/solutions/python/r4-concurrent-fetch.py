from concurrent.futures import ThreadPoolExecutor
import urllib.request

urls = [
    "https://httpbin.org/get",
    "https://httpbin.org/status/404",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/bytes/1024",
    "https://invalid.example.test",
]

def fetch(url):
    try:
        resp = urllib.request.urlopen(url, timeout=5)
        data = resp.read()
        return f"{url}: {resp.status} ({len(data)} bytes)"
    except Exception as e:
        return f"{url}: error: {e}"

with ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(fetch, urls):
        print(result)
