const { network } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log('----------------------------------------------------');
    log(`Deploying CraftToken (CRAFTS) to ${network.name}...`);

    const craftToken = await deploy('CraftToken', {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    log(`CraftToken deployed at: ${craftToken.address}`);
    log('----------------------------------------------------');
};

module.exports.tags = ['all', 'crafts', 'token'];
