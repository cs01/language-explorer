const std = @import("std");
const http = std.http;

pub fn main() !void {
    var server = http.Server.init(std.heap.page_allocator, .{});
    defer server.deinit();

    const address = std.net.Address.parseIp("0.0.0.0", 8080) catch unreachable;
    server.listen(address) catch |e| {
        std.debug.print("error: {}\n", .{e});
        std.process.exit(1);
    };

    while (true) {
        var response = server.accept() catch continue;
        defer response.deinit();

        const target = response.request.target;
        if (std.mem.startsWith(u8, target, "/hello")) {
            var name: []const u8 = "World";
            if (std.mem.indexOf(u8, target, "name=")) |idx| {
                const start = idx + 5;
                const end = std.mem.indexOfScalarPos(u8, target, start, '&') orelse target.len;
                name = target[start..end];
            }

            var buf: [256]u8 = undefined;
            const body = std.fmt.bufPrint(&buf, "{{\"greeting\":\"Hello, {s}!\"}}", .{name}) catch continue;
            response.status = .ok;
            response.transfer_encoding = .{ .content_length = body.len };
            try response.headers.append("Content-Type", "application/json");
            try response.do_send(body);
        } else {
            const body = "{\"error\":\"not found\"}";
            response.status = .not_found;
            response.transfer_encoding = .{ .content_length = body.len };
            try response.headers.append("Content-Type", "application/json");
            try response.do_send(body);
        }
    }
}
