defmodule Router do
  use Plug.Router

  plug :match
  plug :dispatch

  get "/hello" do
    name = conn.query_params["name"] || "World"
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, ~s({"greeting":"Hello, #{name}!"}))
  end

  match _ do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(404, ~s({"error":"not found"}))
  end
end

Plug.Cowboy.http(Router, [], port: 8080)
Process.sleep(:infinity)
