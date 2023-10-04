// Reset your local devnet
// Launch with npx ts-node src/scripts/resetDevnet.ts
// Coded with Starknet.js v5.13.1

import axios from 'axios';

export async function resetDevnetNow() {
    await axios.post('http://127.0.0.1:5050/restart', {}, { headers: { "Content-Type": "application/json" } });
}

