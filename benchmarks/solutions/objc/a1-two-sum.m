#import <Foundation/Foundation.h>

NSArray<NSNumber *> *twoSum(NSArray<NSNumber *> *nums, NSInteger target) {
    NSMutableDictionary<NSNumber *, NSNumber *> *seen = [NSMutableDictionary dictionary];
    for (NSUInteger i = 0; i < nums.count; i++) {
        NSInteger n = nums[i].integerValue;
        NSInteger complement = target - n;
        NSNumber *j = seen[@(complement)];
        if (j != nil) {
            return @[j, @(i)];
        }
        seen[@(n)] = @(i);
    }
    return @[@(-1), @(-1)];
}
