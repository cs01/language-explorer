defmodule TwoSum do
  def two_sum(nums, target) do
    nums
    |> Enum.with_index()
    |> Enum.reduce_while(%{}, fn {n, i}, seen ->
      complement = target - n
      case Map.fetch(seen, complement) do
        {:ok, j} -> {:halt, {j, i}}
        :error -> {:cont, Map.put(seen, n, i)}
      end
    end)
  end
end
