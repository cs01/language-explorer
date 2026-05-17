const std = @import("std");

fn twoSum(nums: []const i32, target: i32) [2]usize {
    var seen = std.AutoHashMap(i32, usize).init(std.heap.page_allocator);
    defer seen.deinit();

    for (nums, 0..) |n, i| {
        const complement = target - n;
        if (seen.get(complement)) |j| {
            return .{ j, i };
        }
        seen.put(n, i) catch unreachable;
    }
    unreachable;
}
