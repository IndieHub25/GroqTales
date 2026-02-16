const { assert, expect } = require('chai');
const { network, ethers, getNamedAccounts, deployments } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');

// ONLY run on testnets (skip on development and mainnet)
developmentChains.includes(network.name)
  ? describe.skip
  : describe('MonadStoryNFT Staging Test', function () {
      let monadStoryNFT, deployer;
      const MINT_PRICE = ethers.parseEther('0.001');
      const STORY_HASH = 'QmTestStoryHash123';
      const METADATA_URI = 'QmTestMetadataURI456';

      beforeEach(async function () {
        try {
          const accounts = await getNamedAccounts();
          deployer = accounts.deployer;
          const signer = await ethers.getSigner(deployer);

          const MonadStoryNFTDeployment =
            await deployments.get('MonadStoryNFT');
          monadStoryNFT = await ethers.getContractAt(
            'MonadStoryNFT',
            MonadStoryNFTDeployment.address,
            signer
          );

          console.log(
            `Connected to MonadStoryNFT at: ${MonadStoryNFTDeployment.address}`
          );
        } catch (error) {
          console.error('Setup error:', error);
          throw error;
        }
      });

      it('has correct contract metadata on testnet', async function () {
        this.timeout(60000);

        const name = await monadStoryNFT.name();
        const symbol = await monadStoryNFT.symbol();
        const mintPrice = await monadStoryNFT.mintPrice();

        console.log(`NFT: ${name} (${symbol})`);
        console.log(`Mint Price: ${ethers.formatEther(mintPrice)} ETH`);

        expect(name).to.equal('GroqTales Story NFT');
        expect(symbol).to.equal('GTALE');
        expect(mintPrice).to.equal(MINT_PRICE);
      });

      it('allows minting and retrieving story on testnet', async function () {
        this.timeout(300000);

        const initialBalance = await monadStoryNFT.balanceOf(deployer);

        const tx = await monadStoryNFT.mintStory(STORY_HASH, METADATA_URI, {
          value: MINT_PRICE,
        });
        const receipt = await tx.wait();
        console.log(`Minted. Gas used: ${receipt.gasUsed.toString()}`);

        const finalBalance = await monadStoryNFT.balanceOf(deployer);
        expect(finalBalance).to.equal(initialBalance + BigInt(1));

        // Verify story content
        const event = receipt.logs.find(
          (log) => log.fragment && log.fragment.name === 'StoryMinted'
        );
        if (!event) {
          throw new Error('StoryMinted event not found in transaction logs');
        }
        const tokenId = event ? event.args[0] : BigInt(1);

        const storyContent = await monadStoryNFT.getStoryContent(tokenId);
        expect(storyContent).to.equal(STORY_HASH);
      });

      it('allows owner to withdraw funds on testnet', async function () {
        this.timeout(300000);

        // Mint to add funds
        await monadStoryNFT.mintStory(STORY_HASH, METADATA_URI, {
          value: MINT_PRICE,
        });

        const contractBalance = await ethers.provider.getBalance(
          monadStoryNFT.target
        );
        console.log(
          `Contract balance: ${ethers.formatEther(contractBalance)} ETH`
        );

        // Withdraw
        await monadStoryNFT.withdrawFunds();

        const contractBalanceAfter = await ethers.provider.getBalance(
          monadStoryNFT.target
        );
        expect(contractBalanceAfter).to.equal(0);
      });
    });
