const std = @import("std");

fn isValid(s: []const u8) bool {
    var stack: [10000]u8 = undefined;
    var top: usize = 0;

    for (s) |c| {
        switch (c) {
            '(', '[', '{' => {
                stack[top] = c;
                top += 1;
            },
            ')', ']', '}' => {
                if (top == 0) return false;
                top -= 1;
                const expected: u8 = switch (c) {
                    ')' => '(',
                    ']' => '[',
                    '}' => '{',
                    else => unreachable,
                };
                if (stack[top] != expected) return false;
            },
            else => {},
        }
    }
    return top == 0;
}
