use crate::bin_hex;

pub fn decode(numbers: &Vec<String>, size_bytes: usize, bits_len: u16) -> Vec<u8> {
    // transform array of hex strings to a binary string
    let iter_numbers = numbers.iter();
    let mut bin_str = String::new();
    for hex_str in iter_numbers {
        let mut hex_str_clean = hex_str.to_string();
        if hex_str[0..=1] == String::from("0x") {
            hex_str_clean = hex_str[2..].to_string();
        }
        let bin_str_full = bin_hex::convert_hex_to_binary(&hex_str_clean).unwrap();
        let bin_str_cropped = &bin_str_full[(bin_str_full.len() - (bits_len as usize))..]; // remove 0b and unnecessary 0
        bin_str.push_str(bin_str_cropped);
    }

    // transform the binary string to an array of bytes
    let mut result: Vec<u8> = Vec::new();
    let mut pos = 0usize;
    for _i in 0..size_bytes {
        let bin_byte = &bin_str[pos..pos + 8];
        let byte = u8::from_str_radix(bin_byte, 2).unwrap();
        result.push(byte);
        pos += 8;
    }
    result
}
