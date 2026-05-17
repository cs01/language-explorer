module Main where

import Control.Concurrent (forkIO)
import Control.Concurrent.Chan

main :: IO ()
main = do
    ch1 <- newChan
    ch2 <- newChan

    forkIO $ do
        mapM_ (writeChan ch1 . Just) [1..20]
        writeChan ch1 Nothing

    forkIO $ do
        let loop = do
                v <- readChan ch1
                case v of
                    Nothing -> writeChan ch2 Nothing
                    Just n  -> do
                        if odd n then writeChan ch2 (Just n) else pure ()
                        loop
        loop

    let consume = do
            v <- readChan ch2
            case v of
                Nothing -> pure ()
                Just n  -> print n >> consume
    consume
