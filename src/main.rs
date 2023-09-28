//use starknet_ff::FieldElement;
use serde::{Deserialize, Serialize};
use serde_json;
use std::fs::File;
//use std::io::BufReader;

 mod constants;
mod file2felts;
mod bin_hex;

#[derive(Debug, Serialize, Deserialize)]
struct FeltField {
    felts: Vec<String>,
}

fn main() {
    println!("In progres...");
    let path="./crown.png";
    let bin = std::fs::read(path).expect("Error reading file.");

    let felts = file2felts::encode(bin, None);
    // or Some(128)
    println!("Result size = {} felts",felts.len());
let output=FeltField{felts:felts};
let file_write = File::create("./file.json").expect("Can't create file.");
serde_json::to_writer_pretty(file_write, &output).expect("Pb during writing.");
}
