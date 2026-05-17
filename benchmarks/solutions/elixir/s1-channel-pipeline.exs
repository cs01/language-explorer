consumer = self()

filter_pid = spawn(fn ->
  receive_loop = fn loop ->
    receive do
      {:value, v} ->
        if rem(v, 2) == 1, do: send(consumer, {:value, v})
        loop.(loop)
      :done ->
        send(consumer, :done)
    end
  end
  receive_loop.(receive_loop)
end)

spawn(fn ->
  Enum.each(1..20, &send(filter_pid, {:value, &1}))
  send(filter_pid, :done)
end)

defmodule Consumer do
  def loop do
    receive do
      {:value, v} -> IO.puts(v); loop()
      :done -> :ok
    end
  end
end

Consumer.loop()
