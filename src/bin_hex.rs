fn to_hex(b: &str) -> Option<char> {
    match b {
        "0000" => Some('0'),
        "0001" => Some('1'),
        "0010" => Some('2'),
        "0011" => Some('3'),
        "0100" => Some('4'),
        "0101" => Some('5'),
        "0110" => Some('6'),
        "0111" => Some('7'),
        "1000" => Some('8'),
        "1001" => Some('9'),
        "1010" => Some('a'),
        "1011" => Some('b'),
        "1100" => Some('c'),
        "1101" => Some('d'),
        "1110" => Some('e'),
        "1111" => Some('f'),
        _ => None,
    }
}

pub fn convert_binary_to_hex(binary: &str) -> Option<String> {
    let padded_binary = binary.trim().replace("0b", "");
    let padded_binary = String::from("0000") + &padded_binary ;
    let padded_binary = &padded_binary[(padded_binary.len() - padded_binary.len() / 4 * 4)..];
    //let mut counter = 0;
    let mut hex_string = String::new();
    for counter in (0..padded_binary.len()).step_by(4) {
        match to_hex(&padded_binary[counter..counter + 4]) {
            Some(converted) => hex_string.push(converted),
            None => return None,
        };
    }

    Some(String::from("0x") + &hex_string)
}