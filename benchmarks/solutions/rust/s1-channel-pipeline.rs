use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx1, rx1) = mpsc::channel();
    let (tx2, rx2) = mpsc::channel();

    thread::spawn(move || {
        for i in 1..=20 {
            tx1.send(i).unwrap();
        }
    });

    thread::spawn(move || {
        for v in rx1 {
            if v % 2 == 1 {
                tx2.send(v).unwrap();
            }
        }
    });

    for v in rx2 {
        println!("{v}");
    }
}
