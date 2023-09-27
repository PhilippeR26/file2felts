use starknet_ff::FieldElement;
use crate::constants;
pub fn encode(path: &str, size_output: Option<u16>) -> Vec<FieldElement> {
    let size_out=size_output.unwrap_or(constants::DEFAULT_OUTPUT_SIZE) as usize;
    let bin = std::fs::read(path).expect("Error reading file");
    let size_bits = bin.len() * 8;
    let mut result:Vec<FieldElement>=Vec::new();
    let mut pos_bits = 0_usize;
    while pos_bits <= size_bits {
        let bit_end=pos_bits+size_out-1;
        // if bit_end > size_bits
        let byte_start=pos_bits/8;
        

    }
    result
}
