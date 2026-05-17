use serde::{Deserialize, Serialize};
use std::io::Read;

#[derive(Deserialize)]
struct User {
    name: String,
    age: u32,
    active: bool,
    email: String,
}

#[derive(Serialize)]
struct Output {
    name: String,
    email: String,
}

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();

    let users: Vec<User> = serde_json::from_str(&input).unwrap_or_else(|e| {
        eprintln!("error: {e}");
        std::process::exit(1);
    });

    let result: Vec<Output> = users
        .into_iter()
        .filter(|u| u.active && u.age > 18)
        .map(|u| Output { name: u.name, email: u.email })
        .collect();

    println!("{}", serde_json::to_string(&result).unwrap());
}
