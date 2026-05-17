import Foundation

let ch1 = AsyncStream<Int>.makeStream()
let ch2 = AsyncStream<Int>.makeStream()

Task {
    for i in 1...20 {
        ch1.continuation.yield(i)
    }
    ch1.continuation.finish()
}

Task {
    for await v in ch1.stream {
        if v % 2 == 1 {
            ch2.continuation.yield(v)
        }
    }
    ch2.continuation.finish()
}

for await v in ch2.stream {
    print(v)
}
