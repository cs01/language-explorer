case System.argv() do
  [] ->
    IO.puts(:stderr, "error: no file argument")
    System.halt(1)

  [path | _] ->
    case File.read(path) do
      {:error, reason} ->
        IO.puts(:stderr, "error: #{reason}")
        System.halt(1)

      {:ok, text} ->
        text
        |> String.downcase()
        |> String.split(~r/[^a-z]+/, trim: true)
        |> Enum.frequencies()
        |> Enum.sort_by(fn {word, count} -> {-count, word} end)
        |> Enum.take(10)
        |> Enum.each(fn {word, count} -> IO.puts("#{word}: #{count}") end)
    end
end
