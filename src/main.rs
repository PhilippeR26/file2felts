//use starknet_ff::FieldElement;
//use serde::{Deserialize, Serialize};
//use std::fs::File;
//use std::io::BufReader;
mod constants;
mod file2felts;

fn main() {
    println!("Hello, world!");
    let felts = file2felts::encode("./crown.png", None);
    // or Some(128)
    println!("Result size = {}",felts.len());
}
