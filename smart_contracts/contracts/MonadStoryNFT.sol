// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

error Withdrawal_Failed();

contract MonadStoryNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
  uint256 private _tokenIdCounter;

  // Base URI for metadata
  string private _baseURIextended;

  // Minting price
  uint256 public mintPrice = 0.001 ether;

  // Maximum supply
  uint256 public constant MAX_SUPPLY = 10000;

  // Mapping from token ID to story content hash (IPFS CID or similar)
  mapping(uint256 => string) private _storyContent;

  event StoryMinted(
    uint256 indexed tokenId,
    address indexed owner,
    string storyHash,
    string metadataURI
  );

  constructor() ERC721('GroqTales Story NFT', 'GTALE') Ownable() {
    _baseURIextended = 'ipfs://';
    _tokenIdCounter = 1; // Start token IDs at 1
  }

  function setBaseURI(string memory baseURI_) external onlyOwner {
    _baseURIextended = baseURI_;
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseURIextended;
  }

  function setMintPrice(uint256 newPrice) external onlyOwner {
    mintPrice = newPrice;
  }

  function mintStory(
    string memory storyHash,
    string memory metadataURI
  ) public payable returns (uint256) {
    require(msg.value >= mintPrice, 'Insufficient payment for minting');
    uint256 tokenId = _tokenIdCounter;
    require(tokenId <= MAX_SUPPLY, 'Maximum supply reached');

    _tokenIdCounter++;
    _safeMint(msg.sender, tokenId);
    _setTokenURI(tokenId, metadataURI);
    _storyContent[tokenId] = storyHash;

    emit StoryMinted(tokenId, msg.sender, storyHash, metadataURI);

    return tokenId;
  }

  function burnStory(uint256 tokenId) public returns (bool) {
    require(_exists(tokenId), 'Token does not exist');
    require(_isApprovedOrOwner(msg.sender, tokenId), 'Not owner nor approved');
    _burn(tokenId);
    delete _storyContent[tokenId];
    return true;
  }

  function getStoryContent(
    uint256 tokenId
  ) public view returns (string memory) {
    require(_exists(tokenId), 'Token does not exist');
    return _storyContent[tokenId];
  }

  function withdrawFunds() external onlyOwner nonReentrant {
    uint256 balance = address(this).balance;
    require(balance > 0, 'No funds');
    (bool success, ) = payable(owner()).call{ value: balance }('');
    if (!success) {
      revert Withdrawal_Failed();
    }
  }
}
