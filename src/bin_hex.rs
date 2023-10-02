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

fn to_bin(b: &char) -> Option<&str> {
    match b {
        '0' => Some("0000"),
        '1' => Some("0001"),
        '2' => Some("0010"),
        '3' => Some("0011"),
        '4' => Some("0100"),
        '5' => Some("0101"),
        '6' => Some("0110"),
        '7' => Some("0111"),
        '8' => Some("1000"),
        '9' => Some("1001"),
        'a' | 'A' => Some("1010"),
        'b' | 'B' => Some("1011"),
        'c' | 'C' => Some("1100"),
        'd' | 'D' => Some("1101"),
        'e' | 'E' => Some("1110"),
        'f' | 'F' => Some("1111"),
        _ => None,
    }
}
pub fn convert_binary_to_hex(binary: &str) -> Option<String> {
    let padded_binary = binary.trim().replace("0b", "");
    let padded_binary = String::from("0000") + &padded_binary;
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

pub fn convert_hex_to_binary(hex: &str) -> Option<String> {
    let mut bin_string=String::new();
    for counter in 0..hex.len() {
        match to_bin(&hex[counter..=counter].chars().next().unwrap()) {
            Some(converted) => bin_string.push_str(converted),
            None => return None,
        }
    }
    Some(String::from("0b") + &bin_string)
}
