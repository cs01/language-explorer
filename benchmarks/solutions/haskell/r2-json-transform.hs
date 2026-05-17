module Main where

import Data.Aeson
import Data.Aeson.Types (parseMaybe)
import qualified Data.ByteString.Lazy as BL
import qualified Data.Vector as V
import System.Exit (exitFailure)
import System.IO (hPutStrLn, stderr)

data User = User { name :: String, age :: Int, active :: Bool, email :: String }

instance FromJSON User where
  parseJSON = withObject "User" $ \v ->
    User <$> v .: "name" <*> v .: "age" <*> v .: "active" <*> v .: "email"

data Output = Output { outName :: String, outEmail :: String }

instance ToJSON Output where
  toJSON (Output n e) = object ["name" .= n, "email" .= e]

main :: IO ()
main = do
  input <- BL.getContents
  case eitherDecode input :: Either String [User] of
    Left err -> hPutStrLn stderr ("error: " ++ err) >> exitFailure
    Right users -> do
      let result = [ Output (name u) (email u)
                   | u <- users, active u, age u > 18 ]
      BL.putStr (encode result)
      putStrLn ""
