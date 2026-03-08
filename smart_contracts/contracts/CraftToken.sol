// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title CraftToken (CRAFTS)
 * @notice ComicCraft Tokens — the primary in-app currency for the GroqTales / ComicCrafts marketplace.
 * @dev ERC-20 token on Monad. Owner-minted supply for testnet; can be upgraded to a
 *      capped / vesting model for mainnet.
 *
 *  Tokenomics (testnet):
 *    - No hard cap (owner can mint freely for testing)
 *    - Holders can burn their own tokens
 *    - Standard transfer / approve / transferFrom
 */
contract CraftToken is ERC20, ERC20Burnable, Ownable {
    /// @notice Emitted when the owner mints new tokens
    event TokensMinted(address indexed to, uint256 amount);

    constructor() ERC20('ComicCraft Tokens', 'CRAFTS') Ownable() {
        // Mint an initial supply of 1,000,000 CRAFTS to deployer for testnet distribution
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /**
     * @notice Mint new CRAFTS tokens (owner only — testnet admin).
     * @param to   Recipient address.
     * @param amount Amount in wei (18 decimals).
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), 'CraftToken: mint to zero address');
        require(amount > 0, 'CraftToken: amount must be > 0');
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}
