require("@nomicfoundation/hardhat-toolbox");
require("@oasisprotocol/sapphire-hardhat");
require("hardhat-contract-sizer");
require("dotenv").config({ path: __dirname + "/.env" });
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: true,
              yulDetails: {
                stackAllocation: true,
                optimizerSteps: "dhfoDgvulfnTUtnIf",
              },
            },
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: true,
              yulDetails: {
                stackAllocation: true,
                optimizerSteps: "dhfoDgvulfnTUtnIf",
              },
            },
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.21",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: true,
              yulDetails: {
                stackAllocation: true,
                optimizerSteps: "dhfoDgvulfnTUtnIf",
              },
            },
          },
          viaIR: true,
        },
      },
    ],
  },
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/psw3g7ysNHn_TuTI9aSpvvkFPhg-q6qL",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    sapphireTestnet: {
      // This is Testnet! If you want Mainnet, add a new network config item.
      url: "https://testnet.sapphire.oasis.dev",
      accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_2],
      chainId: 0x5aff,
    },
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/qFDQkhrEKXyc-DeVeAHxRKsvo2IyKQ3c",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
    },
  },
  defaultNetwork: "sapphireTestnet",
};
