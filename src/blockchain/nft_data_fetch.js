import { Network, Alchemy } from 'alchemy-sdk';


const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

if (!settings.apiKey) {
  throw new Error('ALCHEMY_API_KEY environment variable is required');
}

const alchemy = new Alchemy(settings);

// Print owner's wallet address:
const ownerAddr = 'vitalik.eth';
console.log('fetching NFTs for address:', ownerAddr);
console.log('...');

// Print total NFT count returned in the response:
const nftsForOwner = await alchemy.nft.getNftsForOwner(ownerAddr);
console.log('number of NFTs found:', nftsForOwner.totalCount);
console.log('...');

// Print contract address and tokenId for each NFT:
for (const nft of nftsForOwner.ownedNfts) {
  console.log('===');
  console.log('contract address:', nft.contract.address);
  console.log('token ID:', nft.tokenId);
}
console.log('===');

// Fetch metadata for a particular NFT:
console.log('fetching metadata for a Crypto Coven NFT...');
const response = await alchemy.nft.getNftMetadata(
  '0xc6412aedf66fd1388ee1769df3dbf8d21c2c3f18',
  '1590'
);

// Uncomment this line to see the full api response:
// console.log(response);

// Print some commonly used fields with error handling:
console.log('NFT name: ', response.title || 'Not available');
console.log('token type: ', response.tokenType || 'Not available');
console.log(
  'tokenUri: ',
  response.tokenUri ? response.tokenUri.gateway : 'Not available'
);
console.log(
  'image url: ',
  response.rawMetadata && response.rawMetadata.image
    ? response.rawMetadata.image
    : 'Not available'
);
console.log('time last updated: ', response.timeLastUpdated || 'Not available');
console.log('===');
