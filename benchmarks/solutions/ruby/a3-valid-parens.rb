def valid?(s)
  stack = []
  pairs = { ")" => "(", "]" => "[", "}" => "{" }
  s.each_char do |c|
    if pairs.key?(c)
      return false unless stack.pop == pairs[c]
    else
      stack.push(c)
    end
  end
  stack.empty?
end
