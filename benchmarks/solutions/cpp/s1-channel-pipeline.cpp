#include <iostream>
#include <thread>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <optional>

template<typename T>
class Channel {
    std::queue<T> buf;
    std::mutex mtx;
    std::condition_variable cv;
    bool closed = false;
public:
    void send(T val) {
        std::lock_guard lk(mtx);
        buf.push(std::move(val));
        cv.notify_one();
    }
    void close() {
        std::lock_guard lk(mtx);
        closed = true;
        cv.notify_all();
    }
    std::optional<T> recv() {
        std::unique_lock lk(mtx);
        cv.wait(lk, [&] { return !buf.empty() || closed; });
        if (buf.empty()) return std::nullopt;
        T val = std::move(buf.front());
        buf.pop();
        return val;
    }
};

int main() {
    Channel<int> ch1, ch2;

    std::thread producer([&] {
        for (int i = 1; i <= 20; i++) ch1.send(i);
        ch1.close();
    });

    std::thread filter([&] {
        while (auto v = ch1.recv()) {
            if (*v % 2 == 1) ch2.send(*v);
        }
        ch2.close();
    });

    while (auto v = ch2.recv()) {
        std::cout << *v << "\n";
    }

    producer.join();
    filter.join();
    return 0;
}
