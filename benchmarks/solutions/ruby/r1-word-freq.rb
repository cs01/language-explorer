path = ARGV[0]
unless path
  $stderr.puts "error: no file argument"
  exit 1
end

text = File.read(path)
rescue Errno::ENOENT => e
  $stderr.puts "error: #{e.message}"
  exit 1
end

counts = text.downcase.scan(/[a-z]+/).tally

counts.sort_by { |word, count| [-count, word] }
      .first(10)
      .each { |word, count| puts "#{word}: #{count}" }
