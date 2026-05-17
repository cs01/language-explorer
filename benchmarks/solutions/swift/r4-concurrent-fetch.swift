import Foundation

let urls = [
    "https://httpbin.org/get",
    "https://httpbin.org/status/404",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/bytes/1024",
    "https://invalid.example.test",
]

await withTaskGroup(of: String.self) { group in
    let semaphore = AsyncSemaphore(count: 4)
    for url in urls {
        group.addTask {
            await semaphore.wait()
            defer { semaphore.signal() }
            do {
                let (data, response) = try await URLSession.shared.data(from: URL(string: url)!)
                let status = (response as! HTTPURLResponse).statusCode
                return "\(url): \(status) (\(data.count) bytes)"
            } catch {
                return "\(url): error: \(error.localizedDescription)"
            }
        }
    }
    for await result in group {
        print(result)
    }
}

actor AsyncSemaphore {
    private var count: Int
    private var waiters: [CheckedContinuation<Void, Never>] = []

    init(count: Int) { self.count = count }

    func wait() async {
        if count > 0 {
            count -= 1
        } else {
            await withCheckedContinuation { waiters.append($0) }
        }
    }

    func signal() {
        if waiters.isEmpty {
            count += 1
        } else {
            waiters.removeFirst().resume()
        }
    }
}
