fun isValid(s: String): Boolean {
    val stack = ArrayDeque<Char>()
    val pairs = mapOf(')' to '(', ']' to '[', '}' to '{')
    for (c in s) {
        if (c in pairs) {
            if (stack.removeLastOrNull() != pairs[c]) return false
        } else {
            stack.addLast(c)
        }
    }
    return stack.isEmpty()
}
