use clap::Parser;
use serde::{Deserialize, Serialize};
use serde_json;
use std::fs::File;
use std::time::Instant;

mod bin_hex;
mod constants;
mod file2felts;

#[derive(Debug, Serialize, Deserialize)]
struct FeltField {
    size_bytes: usize,
    felts: Vec<String>,
}

#[derive(Parser, Default, Debug)]
#[clap(author = "Philippe ROSTAN", version, about)]
/// Convert a binary file to a json file containing an array of Cairo felts.
struct Arguments {
    /// `encode` or `decode`
    //#[arg(long)]
    action: String,

    /// source binary file
    #[arg(long)]
    source: String,

    /// destination json file
    #[arg(long)]
    dest: String,
}

fn main() {
    let args = Arguments::parse();

    //println!("args = {:?}", args);

    match args.action.as_ref() {
        "encode" => {
            println!("In progres...");
            let now = Instant::now();
            let path = args.source;
            let bin = std::fs::read(path).expect("Error reading file.");

            let felts = file2felts::encode(&bin, None);
            // or Some(128)
            println!("Result size = {} felts", felts.len());
            let output = FeltField {
                size_bytes: bin.len(),
                felts: felts,
            };
            let file_write = File::create(args.dest).expect("Can't create file.");
            serde_json::to_writer_pretty(file_write, &output).expect("Pb during writing.");
            println!(
                "Processed in {}.{}s.",
                now.elapsed().as_secs(),
                now.elapsed().as_millis()
            );
        }
        "decode" => {
            println!("In progres...");
            let now = Instant::now();

            println!(
                "Processed in {}.{}s.",
                now.elapsed().as_secs(),
                now.elapsed().as_millis()
            );
        }
        _ => {
            println!(
                "{} is not a valid action : use `encode` or `decode`.",
                args.action
            )
        }
    }
}
