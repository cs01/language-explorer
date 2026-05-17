fun twoSum(nums: IntArray, target: Int): Pair<Int, Int> {
    val seen = mutableMapOf<Int, Int>()
    for ((i, n) in nums.withIndex()) {
        val complement = target - n
        seen[complement]?.let { return it to i }
        seen[n] = i
    }
    error("no solution")
}
