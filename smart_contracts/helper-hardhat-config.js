const networkConfig = {
  31337: {
    name: 'hardhat',
  },
  143: {
    name: 'monad_mainnet',
  },
  10143: {
    name: 'monad_testnet',
  },
};
const developmentChains = ['hardhat', 'localhost'];

module.exports = {
  networkConfig,
  developmentChains,
};
