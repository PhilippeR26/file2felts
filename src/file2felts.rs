// use starknet_ff::FieldElement;
use crate::bin_hex;
use crate::constants;

pub fn encode(bin:Vec<u8>, bits_output: Option<u16>) -> Vec<String> {
    let size_out = bits_output.unwrap_or(constants::DEFAULT_OUTPUT_SIZE) as usize;
    assert!(size_out >= 8, "size_output: 8 bits mini.");
    println!("input size = {} bytes", bin.len());
    // transform to a vect of binaries
    let mut binary: Vec<bool> = Vec::new();
    let iter_bin = bin.iter();

    for byte in iter_bin {
        let bin_str = format!("{:b}", byte);
        let string_bin = "0".repeat(7) + &bin_str;
        let string_bin = &string_bin[(string_bin.len() - string_bin.len() / 8 * 8)..];
        // println!("byte={}", string_bin);
        for i in 0..=7 {
            let bit = if string_bin[i..i + 1] == String::from("1") {
                true
            } else {
                false
            };
            binary.push(bit);
        }
    }
    println!("binary len = {} bits",binary.len());


    // transform to an array of hex strings
    let mut result: Vec<String> = Vec::new();
    for i in (0..(binary.len())).step_by(size_out) {
        let mut bin = String::new();
        for j in 0..size_out {
            let char=if i+j >= binary.len() {'0'}else
            {if binary[i + j] == true { '1' } else { '0' }};
            bin.push(char);
        }
        let hex_val = bin_hex::convert_binary_to_hex(&bin).unwrap();
        println!("{}", hex_val);
        result.push(hex_val);
    }

    result
}
