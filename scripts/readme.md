### This folder contains scripts for compilation and deployement tokensale smart contracts.

Command `./scripts/compile.sh <smart-contract name>` copliles the smart contract `./smart-contracts/<smart-contract name>.ligo` into `./build/<smart-contract name>.tz`.

Command `npx node deploy.js` deployes tokensale smart contracts into Hangzhou2net testnet and writes the addresses of the deployed contracts to a json file located in `../deployed` folder.
