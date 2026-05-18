using System.Collections.Generic;

public class Solution
{
    public static (int, int) TwoSum(int[] nums, int target)
    {
        var seen = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++)
        {
            int complement = target - nums[i];
            if (seen.TryGetValue(complement, out int j))
                return (j, i);
            seen[nums[i]] = i;
        }
        return (-1, -1);
    }
}
