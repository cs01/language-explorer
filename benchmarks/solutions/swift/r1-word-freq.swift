import Foundation

guard CommandLine.arguments.count > 1 else {
    fputs("error: no file argument\n", stderr)
    exit(1)
}

guard let data = FileManager.default.contents(atPath: CommandLine.arguments[1]),
      let text = String(data: data, encoding: .utf8) else {
    fputs("error: cannot read file\n", stderr)
    exit(1)
}

var counts: [String: Int] = [:]
for word in text.lowercased().components(separatedBy: CharacterSet.letters.inverted) {
    if !word.isEmpty {
        counts[word, default: 0] += 1
    }
}

let sorted = counts.sorted { a, b in
    a.value != b.value ? a.value > b.value : a.key < b.key
}

for (word, count) in sorted.prefix(10) {
    print("\(word): \(count)")
}
