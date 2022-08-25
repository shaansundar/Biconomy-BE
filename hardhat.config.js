require('@nomiclabs/hardhat-waffle');
const secret = require("./env/secrets.json");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

let accounts;
accounts = {
  mnemonic: secret.MNEMONIC_KEY,
};

module.exports = {
  solidity: "0.8.9",
  paths:{
    sources: "./blockchain/contracts",
    tests: "./blockchain/tests",
    cache: "./blockchain/cache",
    artifacts: "./blockchain/artifacts",
  },
  networks:{
    hardhat: {
      chainId: 31337,
      hardfork: "london",
      accounts,
      allowUnlimitedContractSize: false,
      mining: {
        auto: true,
        interval: 2000
      }
    },
    localhost:{
      url: "http://127.0.0.1:8545/",
      accounts,
      mining: {
        auto: false,
        interval: [3000, 6000]
      }
    },
    mumbai:{
      url: secret.MUMBAI_RPC,
      accounts: [secret.PRIVATE_KEY]
    },
    bsctestnet:{
      url: secret.BSCTESTNET_RPC,
      accounts: [secret.PRIVATE_KEY]
    }
  }
};
