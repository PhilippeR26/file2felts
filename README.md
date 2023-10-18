# file2felts
**Tool to convert in both sides a binary file with an array of Cairo u252 (for Starknet).**  
 
To store large data outside of the block-chain is cost effective (using just a link stored in Starknet), but is also prone to :  
- deletion of the storage area.
- change of the content of the data.

To store small files in Starknet (small NFT image for example) is very expensive, but it ensures that :
- these data will exists as long as the block-chain.
- if deployed in a non upgradable contract, it can't be modified by anybody.

This small tool converts a binary file to a format that can be deployed in the block-chain.  
It can also do the reverse operation.

## Install & run

Using cargo : copy the repo locally ; then :
```bash
cargo run -- .....options
```
or copy the linux 64 executable on your disk, then :
```bash
./file2felts  .....options
```

## Encode

As storage space is VERY expensive in a blockchain, you have to use only very small binaries, that contents very valuable data. 
For technical reason, Starknet can't store more than 253 felts (8kb).  
3 examples are provided : 3 jpg ultra-compressed images 64x64 pixels. These files are about one kb.

In October 2023, the declaration of the contract in the Starnet mainnet block-chain costs about 85 US$, and the deployment of one kb cost about 1100 US$ ! So, only for high value data.  
In testnet, it cost 0,00557 gETH to declare, and 0.079 gETH to deploy a 1kb file. Deploy for 2 kb is x1.8 more expensive ; for 6 kb is x5.0 more.

```bash
file2felts encode --source ./king.gif --dest ./king.json
```

> If you want a specific size of output elements, you can use the option `--bits-len`.  
> By default, this value is set to 251 (a felt is coded on 251 bits).  
> But if you want to encode for example on u128, you have to add the option `--bits-len 128`. 

Then you can store the content of the json file in a Starknet non upgradable smart-contract. See an example [here](typescriptDecode/src/1.declareDeployContract.ts).

## Decode

An example of recovery of the file from Starknet is [here](typescriptDecode/src/2.CallInvokeContract.ts).  
Once the json of the data recovered , you can decode it to recover the original binary file.

```bash
file2felts decode --source ./king.json --dest ./decodedKing.gif
```

## Use in Starknet block-chain

Have a look in this directory [typescriptDecode](typescriptDecode/)
