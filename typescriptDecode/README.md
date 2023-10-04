# Typescript code to store/read binary files in Starknet :

Launch starknet-devnet

## deployement of the contract :

```bash
npx ts-node ./src/1.declareDeployContract.ts
```
After creation of the `king.json` file with the file2felts tool, you send the data in a new smart-contract.
## use of the contract with Starknet.js :

```bash
npx ts-node ./src/2.CallInvokeContract.ts
```
You ask to the contract to send you the content of the binary file, the result is `kingRead.json`.
## Recover the binary file in your computer :

```bash
npx ts-node ./src/3.decodeJson.ts
```
A file `kingRecovered.gif` is created, identical to the original `king.gif`.  
Then you can use this result in your DAPP.  
Typical use case is a non upgradable NFT smart-contract that includes a tiny picture of the NFT. It's an ultra strong proof that this picture belong to this NFT.

