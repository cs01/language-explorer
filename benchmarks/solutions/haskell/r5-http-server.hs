module Main where

import Network.Wai
import Network.Wai.Handler.Warp (run)
import Network.HTTP.Types (status200, status404, hContentType)
import qualified Data.ByteString.Lazy.Char8 as BL
import Data.Maybe (fromMaybe)
import Network.HTTP.Types.URI (parseQuery)

main :: IO ()
main = run 8080 app

app :: Application
app req respond =
  case pathInfo req of
    ["hello"] -> do
      let params = parseQuery (rawQueryString req)
          name = maybe "World" (fromMaybe "World" . fmap (BL.unpack . BL.fromStrict))
                   (lookup "name" params)
          body = BL.pack $ "{\"greeting\":\"Hello, " ++ name ++ "!\"}"
      respond $ responseLBS status200
        [(hContentType, "application/json")] body
    _ -> respond $ responseLBS status404
        [(hContentType, "application/json")]
        "{\"error\":\"not found\"}"
