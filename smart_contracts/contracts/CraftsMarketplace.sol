// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title CraftsMarketplace
 * @notice NFT marketplace that settles in CRAFTS (ERC-20) with platform fees and creator royalties.
 * @dev Replaces the native-ETH NFTMarketplace for the GroqTales ecosystem.
 *
 *  Flow:
 *    1. Seller approves this contract for the NFT.
 *    2. Seller calls `listItem(nftAddress, tokenId, priceInCrafts)`.
 *    3. Buyer approves this contract to spend `priceInCrafts` CRAFTS.
 *    4. Buyer calls `buyItem(nftAddress, tokenId)`.
 *       - Platform fee → treasury.
 *       - Creator royalty → original creator.
 *       - Remainder → seller proceeds mapping.
 *    5. Seller calls `withdrawProceeds()` to claim CRAFTS.
 */
contract CraftsMarketplace is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ── Types ────────────────────────────────────────────────────────────
    struct Listing {
        uint256 price; // in CRAFTS (18 decimals)
        address seller;
    }

    struct RoyaltyInfo {
        address creator;
        uint256 percentBps; // basis points (e.g., 500 = 5%)
    }

    // ── State ────────────────────────────────────────────────────────────
    IERC20 public immutable craftsToken;
    address public platformTreasury;
    uint256 public platformFeeBps; // basis points, e.g., 250 = 2.5%

    // nftAddress → tokenId → Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    // seller → accumulated CRAFTS proceeds
    mapping(address => uint256) private s_proceeds;
    // nftAddress → tokenId → RoyaltyInfo (set once on first listing by creator)
    mapping(address => mapping(uint256 => RoyaltyInfo)) private s_royalties;

    // ── Events ───────────────────────────────────────────────────────────
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
    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );
    event ProceedsWithdrawn(address indexed seller, uint256 amount);
    event PlatformFeeUpdated(uint256 oldBps, uint256 newBps);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    // ── Errors ───────────────────────────────────────────────────────────
    error PriceMustBeAboveZero();
    error NotApprovedForMarketplace();
    error AlreadyListed(address nftAddress, uint256 tokenId);
    error NotListed(address nftAddress, uint256 tokenId);
    error NotOwner();
    error NoProceeds();
    error InsufficientAllowance();

    // ── Modifiers ────────────────────────────────────────────────────────
    modifier notListed(address nftAddress, uint256 tokenId) {
        if (s_listings[nftAddress][tokenId].price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        if (s_listings[nftAddress][tokenId].price == 0) {
            revert NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isNftOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        if (IERC721(nftAddress).ownerOf(tokenId) != spender) {
            revert NotOwner();
        }
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────────
    /**
     * @param _craftsToken  Address of the CRAFTS ERC-20 token contract.
     * @param _treasury     Platform treasury wallet for fee collection.
     * @param _feeBps       Platform fee in basis points (250 = 2.5%).
     */
    constructor(
        address _craftsToken,
        address _treasury,
        uint256 _feeBps
    ) Ownable() {
        require(_craftsToken != address(0), 'Invalid CRAFTS address');
        require(_treasury != address(0), 'Invalid treasury address');
        require(_feeBps <= 1000, 'Fee too high'); // max 10%
        craftsToken = IERC20(_craftsToken);
        platformTreasury = _treasury;
        platformFeeBps = _feeBps;
    }

    // ── Marketplace actions ──────────────────────────────────────────────

    /**
     * @notice List an NFT for sale in CRAFTS.
     * @param nftAddress  NFT contract address.
     * @param tokenId     Token ID to list.
     * @param price       Asking price in CRAFTS (18 decimals).
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId)
        isNftOwner(nftAddress, tokenId, msg.sender)
    {
        if (price == 0) revert PriceMustBeAboveZero();
        if (IERC721(nftAddress).getApproved(tokenId) != address(this)) {
            revert NotApprovedForMarketplace();
        }
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    /**
     * @notice Set creator royalty for an NFT (once, by the current owner before first sale).
     * @param nftAddress    NFT contract address.
     * @param tokenId       Token ID.
     * @param creator       Address to receive royalties.
     * @param percentBps    Royalty in basis points (max 5000 = 50%).
     */
    function setRoyalty(
        address nftAddress,
        uint256 tokenId,
        address creator,
        uint256 percentBps
    ) external isNftOwner(nftAddress, tokenId, msg.sender) {
        require(s_royalties[nftAddress][tokenId].creator == address(0), 'Royalty already set');
        require(percentBps <= 5000, 'Royalty too high');
        require(creator != address(0), 'Invalid creator');
        s_royalties[nftAddress][tokenId] = RoyaltyInfo(creator, percentBps);
    }

    /**
     * @notice Buy a listed NFT with CRAFTS. Buyer must have approved this contract
     *         to spend at least `listing.price` CRAFTS.
     * @param nftAddress  NFT contract address.
     * @param tokenId     Token ID to buy.
     */
    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external nonReentrant isListed(nftAddress, tokenId) {
        Listing memory item = s_listings[nftAddress][tokenId];

        // Check buyer has approved enough CRAFTS
        if (craftsToken.allowance(msg.sender, address(this)) < item.price) {
            revert InsufficientAllowance();
        }

        // Calculate splits
        uint256 platformFee = (item.price * platformFeeBps) / 10000;
        uint256 royaltyFee = 0;
        RoyaltyInfo memory royalty = s_royalties[nftAddress][tokenId];
        if (royalty.creator != address(0) && royalty.percentBps > 0) {
            royaltyFee = (item.price * royalty.percentBps) / 10000;
        }
        uint256 sellerAmount = item.price - platformFee - royaltyFee;

        // Clear listing before external calls (CEI pattern)
        delete s_listings[nftAddress][tokenId];

        // Transfer CRAFTS from buyer
        craftsToken.safeTransferFrom(msg.sender, address(this), item.price);

        // Distribute
        if (platformFee > 0) {
            craftsToken.safeTransfer(platformTreasury, platformFee);
        }
        if (royaltyFee > 0) {
            craftsToken.safeTransfer(royalty.creator, royaltyFee);
        }
        s_proceeds[item.seller] += sellerAmount;

        // Transfer NFT to buyer
        IERC721(nftAddress).safeTransferFrom(item.seller, msg.sender, tokenId);

        emit ItemBought(msg.sender, nftAddress, tokenId, item.price);
    }

    /**
     * @notice Cancel a listing.
     */
    function cancelListing(
        address nftAddress,
        uint256 tokenId
    )
        external
        isListed(nftAddress, tokenId)
        isNftOwner(nftAddress, tokenId, msg.sender)
    {
        delete s_listings[nftAddress][tokenId];
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    /**
     * @notice Update listing price.
     */
    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isListed(nftAddress, tokenId)
        isNftOwner(nftAddress, tokenId, msg.sender)
    {
        if (newPrice == 0) revert PriceMustBeAboveZero();
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    /**
     * @notice Withdraw accumulated CRAFTS proceeds.
     */
    function withdrawProceeds() external nonReentrant {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds == 0) revert NoProceeds();
        s_proceeds[msg.sender] = 0;
        craftsToken.safeTransfer(msg.sender, proceeds);
        emit ProceedsWithdrawn(msg.sender, proceeds);
    }

    // ── Admin ────────────────────────────────────────────────────────────

    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, 'Fee too high');
        emit PlatformFeeUpdated(platformFeeBps, newFeeBps);
        platformFeeBps = newFeeBps;
    }

    function setPlatformTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), 'Invalid treasury');
        emit TreasuryUpdated(platformTreasury, newTreasury);
        platformTreasury = newTreasury;
    }

    // ── Views ────────────────────────────────────────────────────────────

    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }

    function getRoyalty(
        address nftAddress,
        uint256 tokenId
    ) external view returns (RoyaltyInfo memory) {
        return s_royalties[nftAddress][tokenId];
    }
}
