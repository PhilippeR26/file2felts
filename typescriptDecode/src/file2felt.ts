import { num } from "starknet";
import type { BinaryJson } from "./types";
import assert from "./utils"

export function file2felt(buffer: Buffer, bitsLength: number = 251): BinaryJson {
    assert(bitsLength > 0, "bitsLength: Only positive number");
    assert(Number.isInteger(bitsLength)), "bitsLength: Only integer";
    const sizeBytes = buffer.length;
    let binaryString = '';
    for (let i = 0; i < buffer.length; i++) {
        binaryString += buffer[i].toString(2).padStart(8, '0');
    }
    const numbers: string[] = [];
    const totalBits = binaryString.length;
    for (let i = 0; i < totalBits; i += bitsLength) {
        let segment = binaryString.slice(i, i + bitsLength);
        if (segment.length > 0) {
            if (segment.length < bitsLength) {
                segment = segment.padEnd(bitsLength, '0');
            }
            const bigIntValue = BigInt('0b' + segment);
            const hexString =  num.toHex64( bigIntValue);
            numbers.push(hexString);
        }
    }
    const result: BinaryJson = {
        size_bytes: sizeBytes,
        bits_len: bitsLength,
        numbers: numbers
    };
    return result;
}