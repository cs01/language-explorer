defmodule ValidParens do
  def valid?(s) do
    s
    |> String.graphemes()
    |> Enum.reduce_while([], fn
      c, stack when c in ["(", "[", "{"] -> {:cont, [c | stack]}
      ")", ["(" | rest] -> {:cont, rest}
      "]", ["[" | rest] -> {:cont, rest}
      "}", ["{" | rest] -> {:cont, rest}
      _, _ -> {:halt, :invalid}
    end)
    |> Kernel.==([])
  end
end
