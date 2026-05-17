module TwoSum where

import qualified Data.Map.Strict as Map

twoSum :: [Int] -> Int -> (Int, Int)
twoSum nums target = go (zip nums [0..]) Map.empty
  where
    go [] _ = error "no solution"
    go ((n, i):rest) seen =
      case Map.lookup (target - n) seen of
        Just j  -> (j, i)
        Nothing -> go rest (Map.insert n i seen)
