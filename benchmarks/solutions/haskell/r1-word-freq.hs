module Main where

import Data.Char (isAlpha, toLower)
import Data.List (sortBy)
import Data.Map.Strict (Map)
import qualified Data.Map.Strict as Map
import Data.Ord (Down(..), comparing)
import System.Environment (getArgs)
import System.Exit (exitFailure)
import System.IO (hPutStrLn, stderr)

main :: IO ()
main = do
    args <- getArgs
    case args of
        [] -> hPutStrLn stderr "error: no file argument" >> exitFailure
        (path:_) -> do
            text <- readFile path
            let words = filter (not . null) $ splitNonAlpha (map toLower text)
                counts = Map.fromListWith (+) [(w, 1 :: Int) | w <- words]
                sorted = take 10 $ sortBy (comparing (Down . snd) <> comparing fst)
                                          (Map.toList counts)
            mapM_ (\(w, c) -> putStrLn $ w ++ ": " ++ show c) sorted

splitNonAlpha :: String -> [String]
splitNonAlpha [] = []
splitNonAlpha s = let (word, rest) = span isAlpha (dropWhile (not . isAlpha) s)
                 in word : splitNonAlpha rest
