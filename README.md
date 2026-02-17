# file2felts
**Tool to convert in both sides a binary file to an array of Cairo felt252 (for Starknet).**  
 
To store large data outside of a block-chain is cost effective (using just a link stored in a Starknet contract), but it's also prone to :  
- deletion of the storage area.
- change of the content of the data.

To store small files in a Starknet contract (small NFT image for example) is expensive, but it ensures that :
- these data will exists as long as the block-chain.
- if deployed in a non upgradable contract, it can't be modified by anybody.
- an immutable timestamp is set to the data.

This small CLI tool converts a binary file to a format that is maximizing the storage compactness, that can be easily deployed in the block-chain.  
It can also perform the reverse operation.

## Install & run:

Using the source code with cargo  :
```bash
cargo run -- .....options
```
or copy the linux 64 [executable](./executable_linux64) somewhere in the path of your PC, then :
```bash
./file2felts  .....options
```

## Encode:

As storage space is expensive in a blockchain, you have to use only very small binaries, including only valuable data. 

> [!IMPORTANT]
> For technical reason, Starknet can't store more than 9162 bytes (9 kb).  

3 examples are provided : 3 jpg ultra-compressed images 64x64 pixels. These files weights about one kb.

### Encode with CLI command:

```bash
file2felts encode --source ./king.gif --dest ./king.json
```

### Encode with Typescript:

```bash
cd typescriptDecode
npx ts-node ./src/0.encodeKing.ts
```

The result is a json file that can be used to deploy and store the binary data.

```bash
npx ts-node ./src/1.declareDeployContract.ts
```

> [!TIP]
> If you want a specific size of output elements, you can use the option `--bits-len`.  
> By default, this value is set to 251 (a felt252 is coded on 251 bits).  
> But if you want to encode for example on u128, you have to add the option `--bits-len 128`. 

## Decode:
Once the data recovered, you can decode it to recover the original binary file.

### Decode with CLI command:
```bash
file2felts decode --source ./king.json --dest ./decodedKing.gif
```


### Decode with Typescript:
```bash
cd typescriptDecode
npx ts-node ./src/2.CallInvokeContract.ts
npx ts-node ./src/3.decodeJson.ts
```

## Use case:

Typical use case:
- a non upgradable NFT smart-contract, that includes a tiny picture of the NFT. It's an ultra strong proof that this picture belong to this NFT.
- a professional data that needs to be hard timestamped.

