use std::sync::Arc;
use tokio::sync::Semaphore;

#[tokio::main]
async fn main() {
    let urls = vec![
        "https://httpbin.org/get",
        "https://httpbin.org/status/404",
        "https://httpbin.org/delay/1",
        "https://httpbin.org/bytes/1024",
        "https://invalid.example.test",
    ];

    let sem = Arc::new(Semaphore::new(4));
    let mut handles = Vec::new();

    for url in urls {
        let sem = sem.clone();
        let handle = tokio::spawn(async move {
            let _permit = sem.acquire().await.unwrap();
            match reqwest::get(url).await {
                Ok(resp) => {
                    let status = resp.status().as_u16();
                    let bytes = resp.bytes().await.map(|b| b.len()).unwrap_or(0);
                    println!("{url}: {status} ({bytes} bytes)");
                }
                Err(e) => println!("{url}: error: {e}"),
            }
        });
        handles.push(handle);
    }

    for h in handles {
        let _ = h.await;
    }
}
