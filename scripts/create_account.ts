import Web3 from "web3";
import { ethers } from "hardhat";
import fs from "fs";

var web3 = new Web3(
    "https://eth-goerli.g.alchemy.com/v2/BAexJjh839qZdzF1_CxPlqcd3WRQexU9"
);
let provider = new ethers.providers.JsonRpcProvider(
    "https://eth-goerli.g.alchemy.com/v2/BAexJjh839qZdzF1_CxPlqcd3WRQexU9"
);

async function main() {
    interface Account {
        address: string,
        privateKey: string,
    }

    const accounts: Account[] = [];
    for (let i = 0; i < 150; i++) {
        let accountObject = web3.eth.accounts.create();
        accounts.push({
            address: accountObject.address,
            privateKey: accountObject.privateKey,
        });
    }
    var json = JSON.stringify(accounts);
    fs.writeFileSync("./infor.json", `${json}`);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
