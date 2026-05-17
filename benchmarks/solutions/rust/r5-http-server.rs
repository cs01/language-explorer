use axum::{extract::Query, http::StatusCode, response::Json, routing::get, Router};
use serde::Serialize;
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Serialize)]
struct Greeting {
    greeting: String,
}

#[derive(Serialize)]
struct Error {
    error: String,
}

async fn hello(Query(params): Query<HashMap<String, String>>) -> Json<Greeting> {
    let name = params.get("name").cloned().unwrap_or_else(|| "World".into());
    Json(Greeting { greeting: format!("Hello, {name}!") })
}

async fn not_found() -> (StatusCode, Json<Error>) {
    (StatusCode::NOT_FOUND, Json(Error { error: "not found".into() }))
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/hello", get(hello))
        .fallback(not_found);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
