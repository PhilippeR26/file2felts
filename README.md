# file2felts
Converts in both sides a binary file with an array of Cairo u252.  
Useful to store small files in Starknet (NFT image for example).

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

As storage space is very expensive in a blockchain ; you have to use only very small binaries. 
For technical reason, Starknet can't store more than 253 felts (8kb).
3 examples are provided : 3 jpg ultra-compressed images 64x64 pixels. These files are smaller than 2kB.

In October 2023, you can consider that to store 1kb in the Starnet mainnet block-chain will cost about xxETH (xx US$).
In testnet, it cost 0,000_048 gETH.

```bash
file2felts encode --source ./king.gif --dest ./king.json
```

> If you want a specific size of output elements, you can use the option `--bits-len`.  
> By default, this value is set to 251 (a felt is coded on 251 bits).  
> But if you want to encode for example on u128, you have to add the option `--bits-len 128`. 

Then you can store the content of the json file in a Starknet smart-contract. See an example [here TBD]().

## Decode

An example of recovery of the file from Starknet is [here TBD]().  
Once the json of the data recovered , you can decode it to recover the original binary file.

```bash
file2felts decode --source ./king.json --dest ./decodedKing.gif
```

## use in Starknet block-chain

Have a look in this directory [typescriptDecode](typescriptDecode/README.md)
