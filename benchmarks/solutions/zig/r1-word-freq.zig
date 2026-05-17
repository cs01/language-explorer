const std = @import("std");

pub fn main() !void {
    const allocator = std.heap.page_allocator;
    const stdout = std.io.getStdOut().writer();

    var args = std.process.args();
    _ = args.next();
    const path = args.next() orelse {
        std.debug.print("error: no file argument\n", .{});
        std.process.exit(1);
    };

    const text = std.fs.cwd().readFileAlloc(allocator, path, 10 * 1024 * 1024) catch |e| {
        std.debug.print("error: {}\n", .{e});
        std.process.exit(1);
    };

    var counts = std.StringHashMap(usize).init(allocator);
    defer counts.deinit();

    var start: ?usize = null;
    for (text, 0..) |c, i| {
        const is_alpha = std.ascii.isAlphabetic(c);
        if (is_alpha and start == null) {
            start = i;
        } else if (!is_alpha and start != null) {
            const word = std.ascii.lowerString(allocator.alloc(u8, i - start.?) catch unreachable, text[start.?..i]) catch unreachable;
            const entry = counts.getOrPut(word) catch unreachable;
            if (!entry.found_existing) entry.value_ptr.* = 0;
            entry.value_ptr.* += 1;
            start = null;
        }
    }
    if (start) |s| {
        const word = std.ascii.lowerString(allocator.alloc(u8, text.len - s) catch unreachable, text[s..]) catch unreachable;
        const entry = counts.getOrPut(word) catch unreachable;
        if (!entry.found_existing) entry.value_ptr.* = 0;
        entry.value_ptr.* += 1;
    }

    var entries = std.ArrayList(struct { key: []const u8, val: usize }).init(allocator);
    var it = counts.iterator();
    while (it.next()) |e| {
        entries.append(.{ .key = e.key_ptr.*, .val = e.value_ptr.* }) catch unreachable;
    }

    std.mem.sort(@TypeOf(entries.items[0]), entries.items, {}, struct {
        fn cmp(_: void, a: anytype, b: anytype) bool {
            if (a.val != b.val) return a.val > b.val;
            return std.mem.order(u8, a.key, b.key) == .lt;
        }
    }.cmp);

    for (entries.items[0..@min(10, entries.items.len)]) |e| {
        try stdout.print("{s}: {}\n", .{ e.key, e.val });
    }
}
