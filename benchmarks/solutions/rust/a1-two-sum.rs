use std::collections::HashMap;

fn two_sum(nums: &[i32], target: i32) -> (usize, usize) {
    let mut seen = HashMap::new();
    for (i, &n) in nums.iter().enumerate() {
        let complement = target - n;
        if let Some(&j) = seen.get(&complement) {
            return (j, i);
        }
        seen.insert(n, i);
    }
    unreachable!()
}
