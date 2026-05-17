require "json"

begin
  users = JSON.parse($stdin.read)
rescue JSON::ParserError => e
  $stderr.puts "error: #{e.message}"
  exit 1
end

result = users
  .select { |u| u["active"] && u["age"] > 18 }
  .map { |u| { name: u["name"], email: u["email"] } }

puts JSON.generate(result)
