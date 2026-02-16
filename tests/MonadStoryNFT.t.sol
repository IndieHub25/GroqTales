// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/MonadStoryNFT.sol";

contract MonadStoryNFTTest is Test {
    MonadStoryNFT storyNFT;
    address owner = address(this);
    address user1 = address(0x1);
    address user2 = address(0x2);

    string constant STORY_HASH = "QmStoryHashExample1234567890abcdef";
    string constant METADATA_URI = "metadata.json";

    function setUp() public {
        storyNFT = new MonadStoryNFT();
        // Fund user1 with ether for minting
        vm.deal(user1, 10 ether);
    }

    function testInitialState() public {
        assertEq(storyNFT.name(), "GroqTales Story NFT");
        assertEq(storyNFT.symbol(), "GTALE");
        assertEq(storyNFT.mintPrice(), 0.001 ether);
        assertEq(storyNFT.MAX_SUPPLY(), 10000);
    }

    function testMintStory() public {
        vm.prank(user1);
        uint256 tokenId = storyNFT.mintStory{value: 0.001 ether}(STORY_HASH, METADATA_URI);

        assertEq(tokenId, 0);
        assertEq(storyNFT.ownerOf(tokenId), user1);
        assertEq(storyNFT.getStoryContent(tokenId), STORY_HASH);
        assertEq(storyNFT.tokenURI(tokenId), string(abi.encodePacked(storyNFT._baseURI(), METADATA_URI)));
    }

    function testMintStoryInsufficientFunds() public {
        vm.prank(user1);
        vm.expectRevert("Insufficient payment for minting");
        storyNFT.mintStory{value: 0.0005 ether}(STORY_HASH, METADATA_URI);
    }

    function testSetMintPrice() public {
        uint256 newPrice = 0.002 ether;
        storyNFT.setMintPrice(newPrice);
        assertEq(storyNFT.mintPrice(), newPrice);
    }

    function testSetMintPriceUnauthorized() public {
        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        storyNFT.setMintPrice(0.002 ether);
    }

    function testWithdrawFunds() public {
        // Mint a token to add funds to contract
        vm.prank(user1);
        storyNFT.mintStory{value: 0.001 ether}(STORY_HASH, METADATA_URI);

        uint256 initialBalance = owner.balance;
        storyNFT.withdrawFunds();
        uint256 finalBalance = owner.balance;
        assertEq(finalBalance - initialBalance, 0.001 ether);
    }
}
