import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    hardhat: {},
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.PROJECT_ID}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
  solidity: "0.8.9",
};

export default config;
