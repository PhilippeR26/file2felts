// Interact with a contract that is already deployed on devnet.
// Launch with npx ts-node ./src/2.CallInvokeContract.ts
// Coded with Starknet.js v9.3.0

import { RpcProvider, Contract, Account, json, BigNumberish, num, encode, constants, CairoBytes31 } from "starknet";
import { account3ArgentXSepoliaAddress, account3ArgentXSepoliaPrivateKey, alchemyKey } from "./private/A1priv";
import { account3BraavosMainnetAddress, account3BraavosMainnetPrivateKey } from "./private/mainPriv";
import { DevnetProvider } from "starknet-devnet";
import fs from "fs";


//          👇👇👇
// 🚨🚨🚨   Launch starknet-devnet with '--seed 0' before using this script.
//          👆👆👆

interface BinaryJson {
    size_bytes: BigNumberish,
    bits_len: BigNumberish,
    numbers: string[],
}

async function main() {
    const network: string = "devnet" // 🚨 "devnet" or "testnet" or "mainnet".
    let myProvider: RpcProvider;
    let account0: Account;
    switch (network) {
        case "devnet":
            {
                myProvider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc"  });
                const l2DevnetProvider = new DevnetProvider({ timeout: 40_000 });
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


    // Connect the deployed Test instance in devnet
    const testAddress = "0x389c89e87efb859e197355ae42409892aa5ce56d5fbd5decd5719e282ea97c2"; // 🚨 modify in accordance with result of script 1
    // testnet = 0x5eef609d9bdec7c148038b1a9f7e3bebc73061092ca0e8d20f553e62a4c9033
    const compiledTest = json.parse(fs.readFileSync("../cairoContract/store_felts/target/dev/store_felts_StorageFelts.contract_class.json").toString("ascii"));
    const myTestContract = new Contract({
        abi: compiledTest.abi, 
        address: testAddress, 
        providerOrAccount: account0,
    });
    const tmp1=await myProvider.getClassAt(testAddress);
    console.log(tmp1.abi);
    console.log('Test Contract connected at =', myTestContract.address, "\n", myTestContract.functions);

    // Interactions with the contract with call & invoke
    const sizeBytes = await myTestContract.get_size_bytes();
    console.log("sizeBytes=", sizeBytes);
    const dateOfStorage = (await myTestContract.get_storage_timestamp()) as bigint;
    console.log("Date of storage=", new Date(Number(dateOfStorage)*1000));
    const fil = await myTestContract.get_file();
    console.log("file=", fil);
    let hexArray = fil.numbers.map((numb: bigint) => encode.addHexPrefix(numb.toString(16).padStart(64, '0')));
    let jsonF: BinaryJson = {
        size_bytes: fil.size_bytes,
        bits_len: 251,
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