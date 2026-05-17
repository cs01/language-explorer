const std = @import("std");

pub fn main() !void {
    const allocator = std.heap.page_allocator;
    const stdout = std.io.getStdOut().writer();
    const stdin = std.io.getStdIn();

    const input = stdin.readToEndAlloc(allocator, 1024 * 1024) catch |e| {
        std.debug.print("error: {}\n", .{e});
        std.process.exit(1);
    };

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, input, .{}) catch {
        std.debug.print("error: invalid JSON\n", .{});
        std.process.exit(1);
    };

    const users = parsed.value.array;

    try stdout.writeAll("[");
    var first = true;
    for (users.items) |item| {
        const obj = item.object;
        const active = obj.get("active") orelse continue;
        const age = obj.get("age") orelse continue;
        if (active != .true or age.integer <= 18) continue;

        const name = obj.get("name") orelse continue;
        const email = obj.get("email") orelse continue;

        if (!first) try stdout.writeAll(",");
        try stdout.print("{{\"name\":\"{s}\",\"email\":\"{s}\"}}", .{
            name.string, email.string,
        });
        first = false;
    }
    try stdout.writeAll("]\n");
}
