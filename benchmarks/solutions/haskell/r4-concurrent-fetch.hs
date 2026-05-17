module Main where

import Control.Concurrent.Async (mapConcurrently)
import Control.Concurrent.QSem
import Control.Exception (SomeException, try)
import qualified Data.ByteString.Lazy as BL
import Network.HTTP.Simple

urls :: [String]
urls =
    [ "https://httpbin.org/get"
    , "https://httpbin.org/status/404"
    , "https://httpbin.org/delay/1"
    , "https://httpbin.org/bytes/1024"
    , "https://invalid.example.test"
    ]

main :: IO ()
main = do
    sem <- newQSem 4
    results <- mapConcurrently (fetchUrl sem) urls
    mapM_ putStrLn results

fetchUrl :: QSem -> String -> IO String
fetchUrl sem url = do
    waitQSem sem
    result <- try $ do
        req <- parseRequest url
        resp <- httpLBS req
        let status = show (getResponseStatusCode resp)
            bytes = show (BL.length (getResponseBody resp))
        return $ url ++ ": " ++ status ++ " (" ++ bytes ++ " bytes)"
    signalQSem sem
    case result of
        Right s -> return s
        Left e -> return $ url ++ ": error: " ++ show (e :: SomeException)
