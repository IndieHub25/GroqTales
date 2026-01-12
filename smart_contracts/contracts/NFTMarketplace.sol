// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

error NFTMarketplace__PriceMustBeAboveZero();
error NFTMarketplace__NotApprovedForMarketplace();
error NFTMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NFTMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NFTMarketplace__NotOwner();
error NFTMarketplace__PriceNotMet(
  address nftAddress,
  uint256 tokenId,
  uint256 price
);
error NFTMarketplace__NoProceeds();
error NFTMarketplace__TransferFailed();

contract NFTMarketplace is ReentrancyGuard {
  struct Listing {
    uint256 price;
    address seller;
  }
  //NFT contract address -> NFT tokenId -> Listing
  mapping(address => mapping(uint256 => Listing)) private s_listings;
  mapping(address => uint256) private s_proceeds;

  modifier notListed(address nftAddress, uint256 tokenId) {
    Listing memory listing = s_listings[nftAddress][tokenId];
    if (listing.price > 0) {
      revert NFTMarketplace__AlreadyListed(nftAddress, tokenId);
    }
    _;
  }
  modifier isOwner(
    address nftAddress,
    uint256 tokenId,
    address spender
  ) {
    IERC721 nft = IERC721(nftAddress);
    address owner = nft.ownerOf(tokenId);
    if (spender != owner) {
      revert NFTMarketplace__NotOwner();
    }
    _;
  }
  modifier isListed(address nftAddress, uint256 tokenId) {
    Listing memory listing = s_listings[nftAddress][tokenId];
    if (listing.price <= 0) {
      revert NFTMarketplace__NotListed(nftAddress, tokenId);
    }
    _;
  }

  event ItemListed(
    address indexed seller,
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256 price
  );

  event ItemBought(
    address indexed buyer,
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256 price
  );
  event ItemRemoved(
    address indexed seller,
    address indexed nftAddress,
    uint256 indexed tokenId
  );

  function listItem(
    address nftAddress,
    uint256 tokenId,
    uint256 price
  )
    external
    isOwner(nftAddress, tokenId, msg.sender)
    notListed(nftAddress, tokenId)
  {
    if (price <= 0) {
      revert NFTMarketplace__PriceMustBeAboveZero();
    }
    // 1.send the nft to the contrac.Transfer -> contract "hold" the NFT
    // 2. Owners can still hold the nft, and give the marketplace approval to sell the nft for them
    IERC721 nft = IERC721(nftAddress);
    if (nft.getApproved(tokenId) != address(this)) {
      revert NFTMarketplace__NotApprovedForMarketplace();
    }
    s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
    emit ItemListed(msg.sender, nftAddress, tokenId, price);
  }

  function buyItem(
    address nftAddress,
    uint256 tokenId
  ) external payable nonReentrant isListed(nftAddress, tokenId) {
    Listing memory listedItem = s_listings[nftAddress][tokenId];
    if (msg.value != listedItem.price) {
      revert NFTMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
    }
    //We don't just send the money to the seller! -> Why?
    // 1. Reentrancy attack
    // 2. We want our contract to be able to hold funds -> withdraw pattern
    // 3. shift the risk of handling money to the user
    delete (s_listings[nftAddress][tokenId]);
    s_proceeds[listedItem.seller] += listedItem.price;
    IERC721(nftAddress).safeTransferFrom(
      listedItem.seller,
      msg.sender,
      tokenId
    );
    emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
  }

  function cancelListing(
    address nftAddress,
    uint256 tokenId
  )
    external
    isOwner(nftAddress, tokenId, msg.sender)
    isListed(nftAddress, tokenId)
  {
    delete (s_listings[nftAddress][tokenId]);
    //emit event
    emit ItemRemoved(msg.sender, nftAddress, tokenId);
  }

  function updateListing(
    address nftAddress,
    uint256 tokenId,
    uint256 newPrice
  )
    external
    isListed(nftAddress, tokenId)
    isOwner(nftAddress, tokenId, msg.sender)
  {
    if (newPrice <= 0) {
      revert NFTMarketplace__PriceMustBeAboveZero();
    }
    s_listings[nftAddress][tokenId].price = newPrice;
    emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
  }

  function withdrawProceeds() external {
    uint256 proceeds = s_proceeds[msg.sender];
    if (proceeds <= 0) {
      revert NFTMarketplace__NoProceeds();
    }
    s_proceeds[msg.sender] = 0; // Reerntrancy guard

    (bool success, ) = payable(msg.sender).call{ value: proceeds }('');
    if (!success) {
      revert NFTMarketplace__TransferFailed();
    }
  }

  function getListing(
    address nftAddress,
    uint256 tokenId
  ) external view returns (Listing memory) {
    return s_listings[nftAddress][tokenId];
  }

  function getProceeds(address seller) external view returns (uint256) {
    return s_proceeds[seller];
  }
}
