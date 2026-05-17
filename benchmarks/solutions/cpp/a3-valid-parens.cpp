#include <stack>
#include <string>

bool is_valid(const std::string& s) {
    std::stack<char> stk;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            stk.push(c);
        } else {
            if (stk.empty()) return false;
            char expected = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (stk.top() != expected) return false;
            stk.pop();
        }
    }
    return stk.empty();
}
