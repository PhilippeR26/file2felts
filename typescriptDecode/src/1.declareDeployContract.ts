// declare & deploy a contract.
// use of OZ deployer
// launch with npx ts-node 

import { Provider, SequencerProvider, RpcProvider, Account, Contract, ec, json, RawArgs, stark, num, uint256, Calldata, CallData, BigNumberish } from "starknet";
// import { account2TestnetAddress, account2TestnetPrivateKey, junoNMtestnet } from "../A1priv/A1priv";
// import { infuraKey } from "../A-MainPriv/mainPriv";

import fs from "fs";
// import * as dotenv from "dotenv";
// dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          👆👆👆

interface BinaryFile {
    size_bytes: BigNumberish,
    bits_len: BigNumberish,
    len: BigNumberish,
    numbers: BigNumberish[],
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

    // Declare & deploy Test contract in devnet
    const compiledSierra = json.parse(fs.readFileSync("./cairo/storage_felts.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./cairo/storage_felts.casm.json").toString("ascii"));
    const myCallData = new CallData(compiledSierra.abi);
    let myEncodedFile: BinaryFile = {
        size_bytes: 60,
        bits_len: 252,
        len: 2,
        numbers: ["0x434523c467456", "0xca6789678967"]
    };
    const constructor = myCallData.compile("constructor", { file:myEncodedFile });
    const deployResponse = await account0.declareAndDeploy({ contract: compiledSierra, casm: compiledCasm, constructorCalldata: constructor });

    // Connect the new contract instance :
    const myTestContract = new Contract(compiledSierra.abi, deployResponse.deploy.contract_address, provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });