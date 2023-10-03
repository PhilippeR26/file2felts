import { Provider, SequencerProvider, RpcProvider, Account, Contract, ec, json, RawArgs, stark, num, uint256, Calldata, CallData, BigNumberish, hash, constants, encode } from "starknet";
import { formatBalance } from "./formatBalance";
import { account2TestnetAddress, account2TestnetPrivateKey, junoNMtestnet } from "./private/A1priv";

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
        const text="0x" + hexStr1[i];
        const bin2 = "0".repeat(4) + BigInt(text).toString(2);
        const bin4 = bin2.slice(-4);
        bin1=bin1+ bin4;
    }
    const bin3 = bin1.slice(-(Number(dataJson.bits_len)));
    return binStr + bin3
}, "");
let result = new Uint8Array(Number(dataJson.size_bytes));
for (let i = 0; i < dataJson.size_bytes; i++) {
    //if (i < 10) { console.log(binStr.slice(i * 8, (i + 1) * 8)) };
    result[i] = Number.parseInt(binStr.slice(i * 8, (i + 1) * 8), 2);
}
fs.writeFileSync("./kingRecovered.gif",result);

