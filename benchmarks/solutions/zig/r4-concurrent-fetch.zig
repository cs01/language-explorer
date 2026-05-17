const std = @import("std");

const urls = [_][]const u8{
    "https://httpbin.org/get",
    "https://httpbin.org/status/404",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/bytes/1024",
    "https://invalid.example.test",
};

pub fn main() !void {
    const allocator = std.heap.page_allocator;
    const stdout = std.io.getStdOut().writer();

    var threads: [urls.len]std.Thread = undefined;
    var results: [urls.len][]const u8 = undefined;

    // Bounded concurrency via batching (4 at a time)
    var launched: usize = 0;
    while (launched < urls.len) {
        const batch_end = @min(launched + 4, urls.len);
        for (launched..batch_end) |i| {
            threads[i] = std.Thread.spawn(.{}, fetchUrl, .{ allocator, urls[i], &results[i] }) catch |e| {
                results[i] = std.fmt.allocPrint(allocator, "{s}: error: {}", .{ urls[i], e }) catch "error";
                continue;
            };
        }
        for (launched..batch_end) |i| {
            if (threads[i]) |t| t.join();
        }
        launched = batch_end;
    }

    for (results) |r| {
        try stdout.print("{s}\n", .{r});
    }
}

fn fetchUrl(allocator: std.mem.Allocator, url: []const u8, result: *[]const u8) void {
    var client = std.http.Client{ .allocator = allocator };
    defer client.deinit();

    const uri = std.Uri.parse(url) catch {
        result.* = std.fmt.allocPrint(allocator, "{s}: error: invalid URI", .{url}) catch "error";
        return;
    };

    var req = client.open(.GET, uri, .{ .server_header_buffer = allocator.alloc(u8, 4096) catch return }) catch |e| {
        result.* = std.fmt.allocPrint(allocator, "{s}: error: {}", .{ url, e }) catch "error";
        return;
    };
    defer req.deinit();

    req.send() catch |e| {
        result.* = std.fmt.allocPrint(allocator, "{s}: error: {}", .{ url, e }) catch "error";
        return;
    };
    req.wait() catch |e| {
        result.* = std.fmt.allocPrint(allocator, "{s}: error: {}", .{ url, e }) catch "error";
        return;
    };

    const body = req.reader().readAllAlloc(allocator, 1024 * 1024) catch |e| {
        result.* = std.fmt.allocPrint(allocator, "{s}: error: {}", .{ url, e }) catch "error";
        return;
    };

    const status = @intFromEnum(req.status);
    result.* = std.fmt.allocPrint(allocator, "{s}: {} ({} bytes)", .{ url, status, body.len }) catch "error";
}
