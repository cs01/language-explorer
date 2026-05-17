#include <cpr/cpr.h>
#include <future>
#include <iostream>
#include <semaphore>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> urls = {
        "https://httpbin.org/get",
        "https://httpbin.org/status/404",
        "https://httpbin.org/delay/1",
        "https://httpbin.org/bytes/1024",
        "https://invalid.example.test",
    };

    std::counting_semaphore<4> sem(4);
    std::vector<std::future<void>> futures;

    for (const auto& url : urls) {
        futures.push_back(std::async(std::launch::async, [&sem, url]() {
            sem.acquire();
            auto resp = cpr::Get(cpr::Url{url}, cpr::Timeout{5000});
            sem.release();

            if (resp.error) {
                std::cout << url << ": error: " << resp.error.message << "\n";
            } else {
                std::cout << url << ": " << resp.status_code
                          << " (" << resp.text.size() << " bytes)\n";
            }
        }));
    }

    for (auto& f : futures) f.get();
    return 0;
}
