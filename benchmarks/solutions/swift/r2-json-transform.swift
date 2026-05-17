import Foundation

struct User: Decodable {
    let name: String
    let age: Int
    let active: Bool
    let email: String
}

struct Output: Encodable {
    let name: String
    let email: String
}

let input = FileHandle.standardInput.readDataToEndOfFile()
guard let users = try? JSONDecoder().decode([User].self, from: input) else {
    fputs("error: invalid JSON\n", stderr)
    exit(1)
}

let result = users
    .filter { $0.active && $0.age > 18 }
    .map { Output(name: $0.name, email: $0.email) }

let output = try! JSONEncoder().encode(result)
print(String(data: output, encoding: .utf8)!)
