def two_sum(nums, target)
  seen = {}
  nums.each_with_index do |n, i|
    complement = target - n
    return [seen[complement], i] if seen.key?(complement)
    seen[n] = i
  end
end
