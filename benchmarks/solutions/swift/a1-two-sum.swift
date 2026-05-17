func twoSum(_ nums: [Int], _ target: Int) -> (Int, Int) {
    var seen: [Int: Int] = [:]
    for (i, n) in nums.enumerated() {
        let complement = target - n
        if let j = seen[complement] {
            return (j, i)
        }
        seen[n] = i
    }
    fatalError("no solution")
}
