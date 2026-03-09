require('dotenv').config();
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-deploy');
require('solidity-coverage');

// ── Environment Variables ────────────────────────────────────────────────────
const ALCHEMY_ETH_MAINNET_HTTP_URL =
  process.env.ALCHEMY_ETH_MAINNET_HTTP_URL ||
  'https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY';

const MINTER_PRIVATE_KEY =
  process.env.MINTER_PRIVATE_KEY ||
  process.env.PLATFORM_SIGNER_KEY ||
  '0x0000000000000000000000000000000000000000000000000000000000000001';

const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY || 'Your etherscan API key';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.20',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    ethereum_mainnet: {
      url: ALCHEMY_ETH_MAINNET_HTTP_URL,
      accounts: [MINTER_PRIVATE_KEY],
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  paths: {
    deploy: 'deploy',
    deployments: 'deployments',
  },
};
