require('@nomicfoundation/hardhat-toolbox');
require('hardhat-deploy');
require('@nomicfoundation/hardhat-verify');
require('solidity-coverage');
require('hardhat-gas-reporter');
require('dotenv').config();

const MONAD_TEST_RPC_URL =
  process.env.MONAD_TEST_RPC_URL ||
  'https://monad-testnet.g.alchemy.com/v2/YOUR-API-KEY';
const MONAD_MAINNET_RPC_URL =
  process.env.MONAD_MAIN_RPC_URL ||
  'https://monad-mainnet.g.alchemy.com/v2/YOUR-API-KEY';
const PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY || '0x';
const MONADSCAN_API_KEY =
  process.env.MONADSCAN_API_KEY || 'Your monadscan API key';
const MONADSCAN_API_KEY = process.env.MONADSCAN_API_KEY;

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    localhost: {
      chainId: 31337,
    },
    monad_testnet: {
      url: MONAD_TEST_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      chainId: 10143,
      blockConfirmations: 6,
    },
    monad_mainnet: {
      url: MONAD_MAINNET_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      chainId: 143,
      blockConfirmations: 6,
      saveDeployments: true,
    },
  },
  monadscan: {
    apiKey: MONADSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    player: {
      default: 1,
    },
  },
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 100000, // 100 seconds max for running tests
  },
};
