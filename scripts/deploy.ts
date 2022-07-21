import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const accountBalance = await deployer.getBalance();
  console.log(deployer.address);

  console.log("Deploying contract with account: ", deployer.address);
  console.log("Account balance: ", accountBalance.toString());

  const Inbox = await ethers.getContractFactory("Inbox");
  const inbox = await Inbox.deploy("initString");

  console.log("Contract deployed to:", inbox.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
