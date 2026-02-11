// declare & deploy a contract.
// 
// launch with npx ts-node src/1.declareDeployContract.ts
// use Starknet-js v5.21.0

import { Provider, SequencerProvider, RpcProvider, Account, Contract, json, num, uint256, CallData, BigNumberish, hash, constants } from "starknet";
import { formatBalance } from "./formatBalance";
import { account2TestnetAddress, account2TestnetPrivateKey, junoNMtestnet } from "./private/A1priv";
import { account4MainnetAddress, account4MainnetPrivateKey } from "./private/mainPriv";
import { resetDevnetNow } from "./resetDevnetFunc";



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
    const network: string = "devnet" // 🚨 "devnet" or "testnet" or "mainnet".
    let provider: Provider | SequencerProvider | RpcProvider;
    let privateKey0: BigNumberish;
    let account0Address: BigNumberish;
    let account0: Account;
    switch (network) {
        case "devnet":
            //resetDevnetNow(); // only for Starknet-devnet
            provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
            // // for Starknet-devnet
            // privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
            // account0Address = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
            // for starknet-devnet-rs
            privateKey0 = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
            account0Address = "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
            account0 = new Account(provider, account0Address, privateKey0);
            break;
        case "testnet":
            // provider = new RpcProvider({ nodeUrl: junoNMtestnet });
            provider = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545/rpc/v0.4" }); // local pathfinder testnet node
            privateKey0 = account2TestnetPrivateKey;
            account0Address = account2TestnetAddress;
            account0 = new Account(provider, account0Address, privateKey0);
            break;
        case "mainnet":
            provider = new RpcProvider({ nodeUrl: "https://json-rpc.starknet-mainnet.public.lavanet.xyz" });
            privateKey0 = account4MainnetPrivateKey;
            account0Address = account4MainnetAddress;
            account0 = new Account(provider, account0Address, privateKey0);
            break;
        default:
            throw new Error("wrong network name.")
            break;
    }

    console.log('existing account connected.\n');

    // Declare & deploy Test contract in devnet
    const compiledSierra = json.parse(fs.readFileSync("./cairo/storage_felts.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./cairo/storage_felts.casm.json").toString("ascii"));
    const feltField: BinaryJson = json.parse(fs.readFileSync("../king.json").toString("ascii"));
    let myEncodedFile: BinaryFile = {
        size_bytes: feltField.size_bytes,
        bits_len: feltField.bits_len,
        len: feltField.numbers.length,
        numbers: feltField.numbers
    }
    const myCallData = new CallData(compiledSierra.abi);
    const constructor = myCallData.compile("constructor", { file: myEncodedFile });
    const ch = hash.computeSierraContractClassHash(compiledSierra);
    console.log("Class hash =", ch);
    // class hash=0x66f35190131b92c55289a8fe8abdb7f991eb0000019151a0084f5fe3fe38d01

    // to uncomment if devnet :

    const { suggestedMaxFee: estimatedFeeDec } = await account0.estimateDeclareFee({ contract: compiledSierra, casm: compiledCasm });
    console.log("declare est cost =", formatBalance(estimatedFeeDec * 1500n, 18), "US$");
    const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    console.log("Class_hash =", declareResponse.class_hash);
    const txR = await provider.waitForTransaction(declareResponse.transaction_hash);
    if (!("actual_fee" in txR)) { throw new Error("Failure of declare.") };
    console.log("    declare cost =", formatBalance(BigInt(txR.actual_fee) * 1500n, 18), "US$");

    //console.log("constructor =", constructor);
    const { suggestedMaxFee: estimatedFeeDep } = await account0.estimateDeployFee({ classHash: ch, constructorCalldata: constructor });
    console.log(" deploy est cost =", formatBalance(estimatedFeeDep * 1500n, 18), "US$");
    const deployResponse = await account0.deploy({ classHash: ch, constructorCalldata: constructor });
    const txR2 = await provider.waitForTransaction(deployResponse.transaction_hash);
    if (!("actual_fee" in txR2)) { throw new Error("Failure of deploy.") };
    console.log("     deploy cost =", formatBalance(BigInt(txR2.actual_fee) * 1500n, 18), "US$");



    // Connect the new contract instance :
    const myTestContract = new Contract(compiledSierra.abi, deployResponse.contract_address[0], provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);
    // testnet : 0x7dac368af2e1f96f0d72241ded49b5b433103bfdd65fc3663f01376f4ee2615
    // testnet : 0x154a66175310f89c9908835fb85d012b5c42a74c9404d29b4152eec552ca8c
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
