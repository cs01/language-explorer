import Foundation
import Vapor

let app = try Application(.detect())

app.get("hello") { req -> Response in
    let name = req.query[String.self, at: "name"] ?? "World"
    let body = try JSONEncoder().encode(["greeting": "Hello, \(name)!"])
    return Response(
        status: .ok,
        headers: ["Content-Type": "application/json"],
        body: .init(data: body)
    )
}

app.middleware = []
app.any("*") { _ -> Response in
    let body = try JSONEncoder().encode(["error": "not found"])
    return Response(
        status: .notFound,
        headers: ["Content-Type": "application/json"],
        body: .init(data: body)
    )
}

app.http.server.configuration.port = 8080
try app.run()
