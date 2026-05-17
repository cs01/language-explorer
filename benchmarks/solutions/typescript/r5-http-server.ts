import { createServer } from "http";

createServer((req, res) => {
  const url = new URL(req.url!, "http://localhost");
  res.setHeader("Content-Type", "application/json");

  if (url.pathname === "/hello") {
    const name = url.searchParams.get("name") || "World";
    res.writeHead(200);
    res.end(JSON.stringify({ greeting: `Hello, ${name}!` }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "not found" }));
  }
}).listen(8080);
