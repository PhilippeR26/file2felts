// declare & deploy a contract.
// 
// launch with npx ts-node ./src/1.declareDeployContract.ts
// Coded with Starknet.js v9.3.0

import { Provider, RpcProvider, Account, Contract, json, num, uint256, CallData, BigNumberish, hash, constants, CairoBytes31 } from "starknet";
import { formatBalance } from "./formatBalance";
import { account3ArgentXSepoliaAddress, account3ArgentXSepoliaPrivateKey, alchemyKey } from "./private/A1priv";
import { account3BraavosMainnetAddress, account3BraavosMainnetPrivateKey } from "./private/mainPriv";



import fs from "fs";
import { DevnetProvider } from "starknet-devnet";
import type { BinaryJson } from "./types";
import assert from "./utils";

//          👇👇👇
// 🚨🚨🚨   Before using this script:
// - Create a json file. ex: `file2felts encode --source ./king.gif --dest ./king.json`, or script 0
// - Launch starknet-devnet with '--seed 0' before using this script.
//          👆👆👆

interface BinaryFile {
    size_bytes: BigNumberish,
    numbers: BigNumberish[],
}

async function main() {
    const network: string = "devnet" // 🚨 "devnet" or "testnet" or "mainnet".
    let myProvider: RpcProvider;
    let account0: Account;
    switch (network) {
        case "devnet":
            {
                myProvider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
                const l2DevnetProvider = new DevnetProvider({ timeout: 40_000 });
                await l2DevnetProvider.restart();
                if (!(await l2DevnetProvider.isAlive())) {
                    console.log("No l2 devnet.");
                    process.exit();
                }
                const accData = await l2DevnetProvider.getPredeployedAccounts();
                const account0Address = accData[0].address;
                const privateKey0 = accData[0].private_key;
                account0 = new Account({
                    provider: myProvider,
                    address: account0Address,
                    signer: privateKey0
                });
                break;
            }
        case "testnet":
            {
                myProvider = new RpcProvider({ nodeUrl: "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/" + alchemyKey }); // local pathfinder testnet node
                const account0Address = account3ArgentXSepoliaAddress;
                const privateKey0 = account3ArgentXSepoliaPrivateKey;
                account0 = new Account({
                    provider: myProvider,
                    address: account0Address,
                    signer: privateKey0
                });
                break;
            }
        case "mainnet":
            {
                myProvider = new RpcProvider({ nodeUrl: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/" + alchemyKey });
                const account0Address = account3BraavosMainnetPrivateKey;
                const privateKey0 = account3BraavosMainnetAddress;
                account0 = new Account({
                    provider: myProvider,
                    address: account0Address,
                    signer: privateKey0
                });
                break;
            }
        default:
            throw new Error("wrong network name.")
            break;
    }
    console.log('existing account connected.\n');
    console.log(
        "chain Id =", new CairoBytes31(await myProvider.getChainId()).decodeUtf8(),
        ", rpc", await myProvider.getSpecVersion(),
        ", SN version =", (await myProvider.getBlock()).starknet_version);

    // Declare & deploy Test contract in devnet
    const compiledSierra = json.parse(fs.readFileSync("../cairoContract/store_felts/target/dev/store_felts_StorageFelts.contract_class.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("../cairoContract/store_felts/target/dev/store_felts_StorageFelts.compiled_contract_class.json").toString("ascii"));
    const feltField: BinaryJson = json.parse(fs.readFileSync("./king.json").toString("ascii"));
    assert(feltField.bits_len === 251, "This contract uses only felt252");
    console.log("input is",feltField.size_bytes,"bytes.");
    let myEncodedFile: BinaryFile = {
        size_bytes: feltField.size_bytes,
        numbers: feltField.numbers
    }
    const myCallData = new CallData(compiledSierra.abi);
    const constructor = myCallData.compile("constructor", { file: myEncodedFile });
    const ch = hash.computeSierraContractClassHash(compiledSierra);
    console.log("Class hash =", ch);
    // class hash=0x4e066a98d1537753d8d69fa359398cdce7ac488ce1251dc3ffc48b1f6ad7e2b

    const { overall_fee: estimatedFeeDec } = await account0.estimateDeclareFee({ contract: compiledSierra, casm: compiledCasm });
    console.log("declare est cost =", formatBalance(estimatedFeeDec * 1000n / 48n, 18), "US$");
    const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    console.log("Class_hash =", declareResponse.class_hash);
    const txR = await myProvider.waitForTransaction(declareResponse.transaction_hash);
    if (!txR.isSuccess()) { throw new Error("Failure of declare.") };
    console.log("    declare cost =", formatBalance(BigInt(txR.actual_fee.amount) * 1000n / 48n, 18), "US$");

    //console.log("constructor =", constructor);
    const { overall_fee: estimatedFeeDep } = await account0.estimateDeployFee({ classHash: ch, constructorCalldata: constructor });
    console.log(" deploy est cost =", formatBalance(estimatedFeeDep * 1000n / 48n, 18), "US$");
    const deployResponse = await account0.deploy({ classHash: ch, constructorCalldata: constructor });
    const txR2 = await myProvider.waitForTransaction(deployResponse.transaction_hash);
    if (!txR2.isSuccess()) { throw new Error("Failure of deploy.") };
    console.log("     deploy cost =", formatBalance(BigInt(txR2.actual_fee.amount) * 1000n / 48n, 18), "US$");


    // Connect the new contract instance :
    const myTestContract = new Contract({
        abi: compiledSierra.abi,
        address: deployResponse.contract_address[0],
        providerOrAccount: myProvider,
    });
    const aaa=await myProvider.getClassAt(myTestContract.address);
    console.log('✅ Test Contract connected at =', myTestContract.address);
    // testnet : 0x5eef609d9bdec7c148038b1a9f7e3bebc73061092ca0e8d20f553e62a4c9033
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
