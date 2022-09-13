
/* global ethers task */
require('@nomiclabs/hardhat-waffle')



// 运行时注入全局范围
extendEnvironment((hre) => {
  const Web3 = require("web3");
  hre.Web3 = Web3;

  // hre.network.provider is an EIP1193-compatible provider.
  hre.web3 = new Web3(hre.network.provider);
});

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const balance = await ethers.provider.getBalance(taskArgs.account);

    console.log(ethers.utils.formatEther(balance), "ETH");
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more


/**
 * @type import('hardhat/config').HardhatUserConfig 
 */
module.exports = {

  defaultNetwork: "goerli",
  networks: {
    hardhat: {
    },
    goerli: {
      url: "https://goerli.infura.io/v3/" + INFURA_API_KEY,
      accounts: [process.env.TEST_GEMFI_PRIVATE_KEY, process.env.TEST_SIGNATURE_PRIVATE_KEY]
    },
    rinkeby: {
      url: "https://goerli.infura.io/v3/" + INFURA_API_KEY,
      accounts: [process.env.TEST_GEMFI_PRIVATE_KEY, process.env.TEST_SIGNATURE_PRIVATE_KEY]
    },
    mainnet: {
      url: "https://eth-mainnet.g.alchemy.com/v2/" + ALCHEMY_API_KEY,
      accounts: [process.env.TEST_GEMFI_PRIVATE_KEY, process.env.TEST_SIGNATURE_PRIVATE_KEY]
    },
  },

  solidity: "0.8.9",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
