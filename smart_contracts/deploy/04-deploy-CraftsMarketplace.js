const { network, ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();

    // CraftToken must be deployed first (tag dependency)
    const craftToken = await get('CraftToken');

    // Platform fee: 250 bps = 2.5%
    const PLATFORM_FEE_BPS = 250;
    // Treasury defaults to deployer on testnet
    const treasury = process.env.PLATFORM_TREASURY_ADDRESS || deployer;

    log('----------------------------------------------------');
    log(`Deploying CraftsMarketplace to ${network.name}...`);
    log(`  CRAFTS token: ${craftToken.address}`);
    log(`  Treasury:     ${treasury}`);
    log(`  Fee:          ${PLATFORM_FEE_BPS} bps (${PLATFORM_FEE_BPS / 100}%)`);

    const marketplace = await deploy('CraftsMarketplace', {
        from: deployer,
        args: [craftToken.address, treasury, PLATFORM_FEE_BPS],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    log(`CraftsMarketplace deployed at: ${marketplace.address}`);
    log('----------------------------------------------------');
};

module.exports.tags = ['all', 'marketplace', 'crafts-marketplace'];
module.exports.dependencies = ['crafts'];
