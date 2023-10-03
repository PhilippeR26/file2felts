use clap::Parser;
use serde::{Deserialize, Serialize};
use serde_json;
use std::fs::File;
use std::io::{BufReader, Write};
use std::time::Instant;

mod bin_hex;
mod constants;
mod felts2file;
mod file2felts;

#[derive(Debug, Serialize, Deserialize)]
struct FeltField {
    size_bytes: usize,
    bits_len: u16,
    numbers: Vec<String>,
}

#[derive(Parser, Default, Debug)]
#[clap(author = "Philippe ROSTAN", version)]
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

    /// number of bits of output
    #[arg(default_value_t=constants::DEFAULT_OUTPUT_SIZE,short,long)]
    bits_len: u16,
}

struct Arg {
    action: String,
    source: String,
    dest: String,
    bits_len: u16,
}
fn main() {
    // let args = Arguments::parse();
    let args = Arg {
        action: String::from("encode"),
        source: String::from("./king.gif"),
        dest: String::from("./king.json"),
        bits_len: constants::DEFAULT_OUTPUT_SIZE,
    };

    match args.action.as_ref() {
        "encode" => {
            println!("In progress...");
            let now = Instant::now();
            let path = args.source;
            let bin = std::fs::read(path).expect("Error reading file.");
            let felts = file2felts::encode(&bin, args.bits_len);
            // or Some(128)
            println!(
                "Result size = {} components of {} bits",
                felts.len(),
                args.bits_len
            );
            let output = FeltField {
                size_bytes: bin.len(),
                bits_len: args.bits_len,
                numbers: felts,
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
            let path = args.source;

            let file_read = File::open(path).expect("Error reading file.");
            let reader = BufReader::new(file_read); // read/only
            let field: FeltField =
                serde_json::from_reader(reader).expect("JSON was not well-formatted");
            let binary = felts2file::decode(&field.numbers, field.size_bytes, field.bits_len);
            let mut file_write = File::create(args.dest).expect("Can't create file.");
            file_write.write_all(&binary).expect("Error writing file");
            println!("Result size = {} bytes", field.size_bytes);

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
