// interact with a contract that is already deployed on devnet.
// launch with npx ts-node src/2.CallInvokeContract.ts
// Coded with Starknet.js v5.21.0

import { Provider, RpcProvider, SequencerProvider, Contract, Account, json, BigNumberish, num, encode, constants } from "starknet";
import { account2TestnetAddress, account2TestnetPrivateKey, junoNMtestnet } from "./private/A1priv";
import { account4MainnetAddress, account4MainnetPrivateKey } from "./private/mainPriv";

import fs from "fs";


//          👇👇👇
// 🚨🚨🚨   Launch starknet-devnet-rs with '--seed 0' before using this script.
//          👆👆👆

interface BinaryFile {
    size_bytes: BigNumberish,
    bits_len: BigNumberish,
    len: BigNumberish,
    numbers: BigNumberish[],
}

interface BinaryJson {
    size_bytes: BigNumberish,
    bits_len: BigNumberish,
    numbers: string[],
}

async function main() {
    const network: string = "testnet" // 🚨 "devnet" or "testnet" or "mainnet".
    let provider: Provider | SequencerProvider | RpcProvider;
    let privateKey0: BigNumberish;
    let account0Address: BigNumberish;
    let account0: Account;
    switch (network) {
        case "devnet":   
            provider = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
            // for Starknet-devnet
            // privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
            // account0Address = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
            // for starknet-devnet-rs
            privateKey0 = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
            account0Address = "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
            account0 = new Account(provider, account0Address, privateKey0);
            break;
        case "testnet":
            provider = new RpcProvider({ nodeUrl: junoNMtestnet });
            privateKey0 = account2TestnetPrivateKey;
            account0Address = account2TestnetAddress;
            account0 = new Account(provider, account0Address, privateKey0, "1");
            break;
        case "mainnet":
            provider = new RpcProvider({ nodeUrl: "https://json-rpc.starknet-mainnet.public.lavanet.xyz" });
            privateKey0 = account4MainnetPrivateKey;
            account0Address = account4MainnetAddress;
            account0 = new Account(provider, account0Address, privateKey0, "1");
            break;
        default:
            throw new Error("wrong network name.")
            break;
    }
    console.log('existing account connected.\n');


    // Connect the deployed Test instance in devnet
    const testAddress = "0x154a66175310f89c9908835fb85d012b5c42a74c9404d29b4152eec552ca8c"; // modify in accordance with result of script 1
    // was 0x7dac368af2e1f96f0d72241ded49b5b433103bfdd65fc3663f01376f4ee2615
    const compiledTest = json.parse(fs.readFileSync("./cairo/storage_felts.sierra.json").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    console.log('Test Contract connected at =', myTestContract.address, "\n", myTestContract.functions);

    // Interactions with the contract with call & invoke
    myTestContract.connect(account0);
    const sizeBytes = await myTestContract.get_size_bytes();
    console.log("sizeBytes=", sizeBytes);
    const bits_len = await myTestContract.get_bits_len_bytes();
    console.log("bits_len=", bits_len);
    const fil = await myTestContract.get_file();
    console.log("file=", fil);
    let hexArray = fil.numbers.map((numb: bigint) => encode.addHexPrefix(numb.toString(16).padStart(64, '0')));
    let jsonF: BinaryJson = {
        size_bytes: fil.size_bytes,
        bits_len: fil.bits_len,
        numbers: hexArray
    }
    console.log("json=", jsonF);
    fs.writeFileSync('./kingRead.json', json.stringify(jsonF, undefined, 2));

    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });