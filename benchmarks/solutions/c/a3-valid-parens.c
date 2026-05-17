#include <stdbool.h>
#include <string.h>

bool is_valid(const char *s) {
    char stack[10000];
    int top = -1;
    for (int i = 0; s[i]; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            stack[++top] = c;
        } else {
            if (top < 0) return false;
            char expected = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (stack[top--] != expected) return false;
        }
    }
    return top == -1;
}
