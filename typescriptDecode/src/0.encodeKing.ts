// Example of encoding of a binary file, to be able to be stored in Starknet blockchain
// Launch with npx ts-node ./src/0.encodeKing.ts
// Coded with Starknet.js v9.3.0

import * as fs from 'fs';
import { file2felt } from './file2felt';
import { json } from 'starknet';

const filePath = "./king.gif";
const buffOfKing = fs.readFileSync(filePath);
console.log("File size :\n"+ buffOfKing.length, "bytes.");
const jsonOfKing = file2felt(buffOfKing);
console.log(jsonOfKing.numbers.length,"felts.");
fs.writeFileSync("./king.json", json.stringify(jsonOfKing));
console.log('✅ Creation of json completed with success.');

