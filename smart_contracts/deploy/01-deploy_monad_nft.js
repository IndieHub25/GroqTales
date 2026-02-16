const { network } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config.js');
const { verify } = require('../utils/verify.js');

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log('__________________________________________________________');
  const args = [];
  const monadNft = await deploy('MonadStoryNFT', {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations ?? 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.MONADSCAN_API_KEY
  ) {
    log('Verifying ....');
    await verify(monadNft.address, args);
  }
  log('__________________________________________________________');
};

module.exports.tags = ['all', 'monadnft'];
