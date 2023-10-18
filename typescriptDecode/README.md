# Typescript code to store/read binary files in Starknet :

Launch starknet-devnet

## deployement of the contract :

```bash
npx ts-node ./src/1.declareDeployContract.ts
```
After creation of the `king.json` file with the file2felts tool, you send the data in a new smart-contract.

> This contract is already declared in Tesnet with this [Class_hash](https://goerli.voyager.online/class/0x66f35190131b92c55289a8fe8abdb7f991eb0000019151a0084f5fe3fe38d01)
> And has been deployed first [here](https://goerli.voyager.online/contract/0x154a66175310f89c9908835fb85d012b5c42a74c9404d29b4152eec552ca8c)

> You can deploy your own contract (including your own binary file), using this class.
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
Typical use case is a non upgradable NFT smart-contract, that includes a tiny picture of the NFT. It's an ultra strong proof that this picture belong to this NFT.

