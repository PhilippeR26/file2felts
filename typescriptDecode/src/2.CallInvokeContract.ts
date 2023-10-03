// interact with a contract that is already deployed on devnet.
// launch with npx ts-node src/scripts/11.CallInvokeContract.ts
// Coded with Starknet.js v5.16.0

import { Provider, RpcProvider, SequencerProvider, Contract, Account, json, BigNumberish,num, encode } from "starknet";
//import { account2TestnetAddress, account2TestnetPrivateKey, junoNMtestnet } from "../A1priv/A1priv";
//import { infuraKey } from "../A-MainPriv/mainPriv";
import fs from "fs";
//import * as dotenv from "dotenv";
//dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
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
    const provider = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    // const provider = new RpcProvider({ nodeUrl: 'https://starknet-goerli.infura.io/v3/' + infuraKey });


    const privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
    const account0Address = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    // const privateKey0 = account2TestnetPrivateKey;
    // const account0Address = account2TestnetAddress;
    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('existing account connected.\n');


    // Connect the deployed Test instance in devnet
    const testAddress = "0x453552508dbe3a03f6a8ba84253f58c010c6672afa56ead16070480db78fd86"; // modify in accordance with result of script 5
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
    let hexArray=fil.numbers.map((numb:bigint)=>encode.addHexPrefix(numb.toString(16).padStart(64, '0')));
    let jsonF: BinaryJson = {
        size_bytes: fil.size_bytes,
        bits_len: fil.bits_len,
        numbers: hexArray
    }
    console.log("json=", jsonF);
    fs.writeFileSync('./king.json', json.stringify(jsonF, undefined, 2));

    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });