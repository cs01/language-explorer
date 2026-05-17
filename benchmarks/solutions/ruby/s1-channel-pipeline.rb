ch1 = Queue.new
ch2 = Queue.new

Thread.new do
  (1..20).each { |i| ch1 << i }
  ch1 << nil
end

Thread.new do
  while (v = ch1.pop)
    ch2 << v if v.odd?
  end
  ch2 << nil
end

while (v = ch2.pop)
  puts v
end
