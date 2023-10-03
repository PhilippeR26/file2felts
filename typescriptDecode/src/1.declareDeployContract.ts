// declare & deploy a contract.
// use of OZ deployer
// launch with npx ts-node 

import { Provider, SequencerProvider, RpcProvider, Account, Contract, ec, json, RawArgs, stark, num, uint256, Calldata, CallData, BigNumberish, hash, constants } from "starknet";
import { formatBalance } from "./formatBalance";
import { account2TestnetAddress, account2TestnetPrivateKey, junoNMtestnet } from "./private/A1priv";

import fs from "fs";

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
    // const provider = new SequencerProvider({ baseUrl: "http://127.0.0.1:5050" });
    //const provider = new RpcProvider({ nodeUrl: junoNMtestnet});
    const provider = new SequencerProvider({ network: constants.NetworkName.SN_GOERLI });


    //const privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
    //const account0Address = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
     const privateKey0 = account2TestnetPrivateKey;
     const account0Address = account2TestnetAddress;
    const account0 = new Account(provider, account0Address, privateKey0,"1");
    console.log('existing account connected.\n');

    // Declare & deploy Test contract in devnet
    const compiledSierra = json.parse(fs.readFileSync("./cairo/storage_felts.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./cairo/storage_felts.casm.json").toString("ascii"));
    const feltField:BinaryJson=json.parse(fs.readFileSync("./king.json").toString("ascii"));
    let myEncodedFile: BinaryFile = {
        size_bytes: feltField.size_bytes,
        bits_len: feltField.bits_len,
        len: feltField.numbers.length,
        numbers: feltField.numbers
    }
    const myCallData = new CallData(compiledSierra.abi);
    const constructor = myCallData.compile("constructor", { file: myEncodedFile });
    const ch=hash.computeSierraContractClassHash(compiledSierra);
    console.log("Class hash =",ch);

    // to uncomment if devnet :

    // const { suggestedMaxFee: estimatedFeeDec }=await account0.estimateDeclareFee( {contract: compiledSierra, casm: compiledCasm} );
    // console.log("declare est cost =", formatBalance(estimatedFeeDec * 1500n, 18), "US$");
    // const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    // console.log("Class_hash =",declareResponse.class_hash);
    // const txR = await provider.waitForTransaction(declareResponse.transaction_hash);
    // if (!("actual_fee" in txR)) { throw new Error("Failure of declare.") };
    // console.log("    declare cost =", formatBalance(BigInt(txR.actual_fee) * 1500n, 18), "US$");

    console.log("constructor =",constructor);
    const { suggestedMaxFee: estimatedFeeDep}=await account0.estimateDeployFee( {classHash:ch,constructorCalldata:constructor} );
    console.log(" deploy est cost =", formatBalance(estimatedFeeDep * 1500n, 18), "US$");
    const deployResponse = await account0.deploy({ classHash: ch, constructorCalldata: constructor });
    const txR2 = await provider.waitForTransaction(deployResponse.transaction_hash);
    if (!("actual_fee" in txR2)) { throw new Error("Failure of deploy.") };
    console.log("     deploy cost =", formatBalance(BigInt(txR2.actual_fee) * 1500n, 18), "US$");



    // Connect the new contract instance :
    const myTestContract = new Contract(compiledSierra.abi, deployResponse.contract_address[0], provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);
    // testnet : 0x7dac368af2e1f96f0d72241ded49b5b433103bfdd65fc3663f01376f4ee2615
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
