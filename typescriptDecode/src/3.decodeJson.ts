// Decode the json file recovered from the smart-contract, and build the binary file.
// Launch with npx ts-node ./src/3.decodeJson.ts
// Coded with Starknet.js v9.3.0

import { json, encode } from "starknet";
import fs from "fs";

interface BinaryJson {
    size_bytes: bigint,
    bits_len: bigint,
    numbers: string[],
}

const dataJson: BinaryJson = json.parse(fs.readFileSync("./kingRead.json").toString("ascii"));
const binStr = dataJson.numbers.reduce((binStr, hexStr) => {
    const hexStr1 = encode.removeHexPrefix(hexStr);
    let bin1 = "0".repeat(Number(dataJson.bits_len));
    for (let i = 0; i < hexStr1.length; i++) {
        const text = "0x" + hexStr1[i];
        const bin2 = "0".repeat(4) + BigInt(text).toString(2);
        const bin4 = bin2.slice(-4);
        bin1 = bin1 + bin4;
    }
    const bin3 = bin1.slice(-(Number(dataJson.bits_len)));
    return binStr + bin3
}, "");
let result = new Uint8Array(Number(dataJson.size_bytes));
for (let i = 0; i < dataJson.size_bytes; i++) {
    result[i] = Number.parseInt(binStr.slice(i * 8, (i + 1) * 8), 2);
}
fs.writeFileSync("./kingRecovered.gif", result);
console.log('✅ Test completed.');

