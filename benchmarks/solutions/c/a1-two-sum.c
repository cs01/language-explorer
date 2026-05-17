#include <stdlib.h>

struct Result { int i; int j; };

struct Result two_sum(int *nums, int len, int target) {
    for (int i = 0; i < len; i++) {
        for (int j = i + 1; j < len; j++) {
            if (nums[i] + nums[j] == target) {
                return (struct Result){i, j};
            }
        }
    }
    return (struct Result){-1, -1};
}
