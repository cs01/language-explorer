module ValidParens where

isValid :: String -> Bool
isValid = go []
  where
    go [] []     = True
    go _  []     = False
    go stack (c:cs)
      | c `elem` "([{" = go (c:stack) cs
      | otherwise = case stack of
          []     -> False
          (x:xs) -> matching x c && go xs cs
    matching '(' ')' = True
    matching '[' ']' = True
    matching '{' '}' = True
    matching _   _   = False
