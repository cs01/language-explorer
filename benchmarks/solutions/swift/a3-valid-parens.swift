func isValid(_ s: String) -> Bool {
    var stack: [Character] = []
    for c in s {
        switch c {
        case "(", "[", "{": stack.append(c)
        case ")": guard stack.popLast() == "(" else { return false }
        case "]": guard stack.popLast() == "[" else { return false }
        case "}": guard stack.popLast() == "{" else { return false }
        default: break
        }
    }
    return stack.isEmpty
}
