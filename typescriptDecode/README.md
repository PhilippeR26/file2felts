# Typescript code to store/read binary files in Starknet :

Launch starknet-devnet

## deployment of the contract :
After creation of the `king.json` file with the file2felts tool (or with the [script 0](./src/0.encodeKing.ts)), you have to send the data in a new smart-contract.

```bash
npx ts-node ./src/1.declareDeployContract.ts
```

> This contract is already declared in Testnet with this [Class_hash](https://sepolia.voyager.online/class/0x04e066a98d1537753d8d69fa359398cdce7ac488ce1251dc3ffc48b1f6ad7e2b)  
> and has been deployed first [here](https://sepolia.voyager.online/contract/0x05eef609d9bdec7c148038b1a9f7e3bebc73061092ca0e8d20f553e62a4c9033)

> You can deploy your own contract (that includes your own binary file), using this class.
## use of the contract with Starknet.js :

```bash
npx ts-node ./src/2.CallInvokeContract.ts
```
You ask to the contract to send you the content of the binary file (in felt252 format), the result is `kingRead.json`.

## Recover the binary file in your computer :

```bash
npx ts-node ./src/3.decodeJson.ts
```
From the json file (felt252 format), a binary file `kingRecovered.gif` is created, identical to the original `king.gif`.  
Then you can use this result in your DAPP.  

