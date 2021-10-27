require("@nomiclabs/hardhat-waffle")
require("dotenv").config()

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    // mumbai: {
    //   url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    //   accounts: [process.env.ACCOUNT]
    // },
    // mainnet: {
    //   url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    //   accounts: [process.env.ACCOUNT]
    // }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}