require "net/http"
require "uri"

urls = [
  "https://httpbin.org/get",
  "https://httpbin.org/status/404",
  "https://httpbin.org/delay/1",
  "https://httpbin.org/bytes/1024",
  "https://invalid.example.test",
]

semaphore = Queue.new
4.times { semaphore << true }

threads = urls.map do |url|
  Thread.new do
    semaphore.pop
    begin
      uri = URI.parse(url)
      resp = Net::HTTP.get_response(uri)
      puts "#{url}: #{resp.code} (#{resp.body.bytesize} bytes)"
    rescue => e
      puts "#{url}: error: #{e.message}"
    ensure
      semaphore << true
    end
  end
end

threads.each(&:join)
