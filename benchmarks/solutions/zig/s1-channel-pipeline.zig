const std = @import("std");

fn Channel(comptime T: type) type {
    return struct {
        buf: [32]T = undefined,
        head: usize = 0,
        tail: usize = 0,
        count: usize = 0,
        closed: bool = false,
        mutex: std.Thread.Mutex = .{},
        not_empty: std.Thread.Condition = .{},
        not_full: std.Thread.Condition = .{},

        const Self = @This();

        fn send(self: *Self, val: T) void {
            self.mutex.lock();
            defer self.mutex.unlock();
            while (self.count == 32) self.not_full.wait(&self.mutex);
            self.buf[self.tail] = val;
            self.tail = (self.tail + 1) % 32;
            self.count += 1;
            self.not_empty.signal();
        }

        fn recv(self: *Self) ?T {
            self.mutex.lock();
            defer self.mutex.unlock();
            while (self.count == 0 and !self.closed) self.not_empty.wait(&self.mutex);
            if (self.count == 0) return null;
            const val = self.buf[self.head];
            self.head = (self.head + 1) % 32;
            self.count -= 1;
            self.not_full.signal();
            return val;
        }

        fn close(self: *Self) void {
            self.mutex.lock();
            defer self.mutex.unlock();
            self.closed = true;
            self.not_empty.broadcast();
        }
    };
}

pub fn main() !void {
    var ch1 = Channel(i32){};
    var ch2 = Channel(i32){};

    const t1 = try std.Thread.spawn(.{}, struct {
        fn run(ch: *Channel(i32)) void {
            for (1..21) |i| ch.send(@intCast(i));
            ch.close();
        }
    }.run, .{&ch1});

    const t2 = try std.Thread.spawn(.{}, struct {
        fn run(in_ch: *Channel(i32), out_ch: *Channel(i32)) void {
            while (in_ch.recv()) |v| {
                if (@mod(v, 2) == 1) out_ch.send(v);
            }
            out_ch.close();
        }
    }.run, .{ &ch1, &ch2 });

    const stdout = std.io.getStdOut().writer();
    while (ch2.recv()) |v| {
        try stdout.print("{}\n", .{v});
    }

    t1.join();
    t2.join();
}
