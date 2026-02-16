import { Network, Alchemy } from 'alchemy-sdk';

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

// get all the sent transactions from given address
const sentTransactions = alchemy.core
  .getAssetTransfers({
    fromBlock: '0x0',
    fromAddress: '0x994b342dd87fc825f66e51ffa3ef71ad818b6893',
    category: ['erc721', 'external', 'erc20'],
  })
  .then((response) => {
    console.log('Sent Transactions:', response);
    return response;
  })
  .catch((error) => {
    console.error('Error fetching transactions:', error);
    throw error;
  });

// Additional to get latest block number

async function main() {
  await getLatestBlockNumber();
  await sentTransactions;
  await getSpecificBlock();
}
main().catch(console.error);
