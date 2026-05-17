urls = [
  "https://httpbin.org/get",
  "https://httpbin.org/status/404",
  "https://httpbin.org/delay/1",
  "https://httpbin.org/bytes/1024",
  "https://invalid.example.test",
]

urls
|> Task.async_stream_nolink(4, fn url ->
  case :httpc.request(:get, {String.to_charlist(url), []}, [timeout: 5000], body_format: :binary) do
    {:ok, {{_, status, _}, _, body}} ->
      "#{url}: #{status} (#{byte_size(body)} bytes)"
    {:error, reason} ->
      "#{url}: error: #{inspect(reason)}"
  end
end, timeout: 10_000)
|> Enum.each(fn
  {:ok, result} -> IO.puts(result)
  {:exit, reason} -> IO.puts("error: #{inspect(reason)}")
end)
