require "webrick"
require "json"

server = WEBrick::HTTPServer.new(Port: 8080, Logger: WEBrick::Log.new("/dev/null"))

server.mount_proc "/hello" do |req, res|
  name = req.query["name"] || "World"
  res["Content-Type"] = "application/json"
  res.body = JSON.generate(greeting: "Hello, #{name}!")
end

server.mount_proc "/" do |req, res|
  res.status = 404
  res["Content-Type"] = "application/json"
  res.body = JSON.generate(error: "not found")
end

server.start
