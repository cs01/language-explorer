input = IO.read(:stdio, :eof)

case Jason.decode(input) do
  {:error, _} ->
    IO.puts(:stderr, "error: invalid JSON")
    System.halt(1)

  {:ok, users} ->
    result =
      users
      |> Enum.filter(&(&1["active"] and &1["age"] > 18))
      |> Enum.map(&Map.take(&1, ["name", "email"]))

    IO.puts(Jason.encode!(result))
end
