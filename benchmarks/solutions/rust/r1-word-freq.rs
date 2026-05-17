use std::collections::HashMap;
use std::env;
use std::fs;
use std::process;

fn main() {
    let path = env::args().nth(1).unwrap_or_else(|| {
        eprintln!("error: no file argument");
        process::exit(1);
    });

    let text = fs::read_to_string(&path).unwrap_or_else(|e| {
        eprintln!("error: {e}");
        process::exit(1);
    });

    let mut counts: HashMap<&str, usize> = HashMap::new();
    for word in text.split(|c: char| !c.is_alphabetic()) {
        if !word.is_empty() {
            *counts.entry(word).or_insert(0) += 1;
        }
    }

    let mut sorted: Vec<_> = counts.into_iter().collect();
    sorted.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));

    for (word, count) in sorted.iter().take(10) {
        println!("{word}: {count}");
    }
}
