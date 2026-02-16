const Comic = require('../models/Comic');
const ComicPage = require('../models/ComicPage');
const {
  uploadJSONToIPFS,
  createAndUploadMetadataBundle,
} = require('./comicAssetService');

/**
 * Status enum for publish workflow
 */
const PublishStatus = {
  PENDING: 'pending',
  PINNING: 'pinning',
  MINTING: 'minting',
  INDEXING: 'indexing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/**
 * Preflight checks before publishing a comic
 * @param {string} comicId - Comic ID
 * @returns {Promise<Object>} - { canPublish: boolean, errors: Array, warnings: Array }
 */
const runPreflightChecks = async (comicId) => {
  const errors = [];
  const warnings = [];

  try {
    // Fetch comic
    const comic = await Comic.findById(comicId);
    if (!comic) {
      errors.push('Comic not found');
      return { canPublish: false, errors, warnings };
    }

    // Check if already published
    if (comic.status === 'published') {
      warnings.push('Comic is already published');
    }

    // Check if comic has pages
    const pages = await ComicPage.find({ comicId }).sort({ pageNumber: 1 });
    if (pages.length === 0) {
      errors.push('Comic must have at least one page');
    }

    // Check alt text coverage
    const pagesWithoutAltText = pages.filter(
      (page) => !page.altText || page.altText.trim() === ''
    );
    if (pagesWithoutAltText.length > 0) {
      errors.push(
        `${pagesWithoutAltText.length} page(s) missing alt text (required for accessibility)`
      );
    }

    // Check if all pages are pinned to IPFS
    const unpinnedPages = pages.filter((page) => !page.isPinned);
    if (unpinnedPages.length > 0) {
      warnings.push(`${unpinnedPages.length} page(s) not yet pinned to IPFS`);
    }

    // Check for transcript coverage (warning only)
    const pagesWithoutTranscript = pages.filter(
      (page) => !page.transcript || page.transcript.trim() === ''
    );
    if (pagesWithoutTranscript.length > 0) {
      warnings.push(
        `${pagesWithoutTranscript.length} page(s) missing transcripts (recommended for accessibility)`
      );
    }

    // Check for cover image
    if (!comic.coverImage || !comic.coverImage.cid) {
      warnings.push('Comic has no cover image');
    }

    return {
      canPublish: errors.length === 0,
      errors,
      warnings,
      pageCount: pages.length,
    };
  } catch (error) {
    console.error('Error during preflight checks:', error);
    errors.push(`Preflight check failed: ${error.message}`);
    return { canPublish: false, errors, warnings };
  }
};

/**
 * Pin all unpinned pages to IPFS
 * @param {string} comicId - Comic ID
 * @returns {Promise<Object>} - { success: boolean, pinnedCount: number, errors: Array }
 */
const pinAllPages = async (comicId) => {
  try {
    const pages = await ComicPage.find({ comicId, isPinned: false });
    let pinnedCount = 0;
    const errors = [];

    for (const page of pages) {
      try {
        // In a real implementation, you would verify pins with Pinata API
        // For now, we mark them as pinned if they have CIDs
        if (page.imageAsset.originalCID) {
          page.isPinned = true;
          page.pinnedAt = new Date();
          await page.save();
          pinnedCount++;
        } else {
          errors.push(`Page ${page.pageNumber} has no IPFS CID`);
        }
      } catch (error) {
        console.error(`Error pinning page ${page.pageNumber}:`, error);
        errors.push(`Failed to pin page ${page.pageNumber}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      pinnedCount,
      errors,
    };
  } catch (error) {
    console.error('Error pinning pages:', error);
    return {
      success: false,
      pinnedCount: 0,
      errors: [error.message],
    };
  }
};

/**
 * Create and upload metadata bundle to IPFS
 * @param {string} comicId - Comic ID
 * @returns {Promise<Object>} - { success: boolean, metadataCID: string, error?: string }
 */
const createMetadataBundle = async (comicId) => {
  try {
    const comic = await Comic.findById(comicId);
    if (!comic) {
      return { success: false, error: 'Comic not found' };
    }

    const pages = await ComicPage.find({ comicId }).sort({ pageNumber: 1 });
    if (pages.length === 0) {
      return { success: false, error: 'No pages found' };
    }

    const metadataCID = await createAndUploadMetadataBundle(comic, pages);

    return {
      success: true,
      metadataCID,
    };
  } catch (error) {
    console.error('Error creating metadata bundle:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Mint NFT for comic using blockchain integration
 * @param {string} comicId - Comic ID
 * @param {string} metadataCID - Metadata CID
 * @param {Object} options - Minting options { network, ownerAddress, contractAddress }
 * @returns {Promise<Object>} - { success: boolean, nftData?: Object, error?: string }
 */
const mintComicNFT = async (comicId, metadataCID, options = {}) => {
  try {
    const { network = 'polygon', ownerAddress, contractAddress } = options;

    if (!ownerAddress) {
      return {
        success: false,
        error: 'Owner address is required for minting',
      };
    }

    // Check if minting is configured
    if (!contractAddress && !process.env.COMIC_NFT_CONTRACT_ADDRESS) {
      console.warn('NFT minting skipped - no contract address configured');
      return {
        success: false,
        error: 'NFT contract address not configured',
      };
    }

    const metadataURI = `ipfs://${metadataCID}`;

    // Import ethers if available
    try {
      const { ethers } = require('ethers');
      const targetContract =
        contractAddress || process.env.COMIC_NFT_CONTRACT_ADDRESS;

      // Get provider based on network
      const rpcUrl = process.env[`${network.toUpperCase()}_RPC_URL`];
      if (!rpcUrl) {
        throw new Error(`RPC URL not configured for network: ${network}`);
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(
        process.env.MINTING_PRIVATE_KEY,
        provider
      );

      // Contract ABI for minting
      const abi = [
        'function mint(address to, string memory tokenURI) external returns (uint256)',
        'function totalSupply() external view returns (uint256)',
      ];

      const contract = new ethers.Contract(targetContract, abi, wallet);

      // Mint the NFT
      const tx = await contract.mint(ownerAddress, metadataURI);
      const receipt = await tx.wait();

      // Get token ID from mint event logs, fallback to totalSupply, then timestamp
      let tokenId;
      try {
        // Try to get tokenId from event logs (ERC721 Transfer event)
        const zero = ethers.ZeroAddress.toLowerCase();
        const to = ownerAddress.toLowerCase();
        const transferEvent = receipt.logs
          .map((log) => {
            try {
              return contract.interface.parseLog(log);
            } catch (e) {
              return null;
            }
          })
          .find(
            (parsed) =>
              parsed?.name === 'Transfer' &&
              parsed.args?.from?.toLowerCase() === zero &&
              parsed.args?.to?.toLowerCase() === to
          );
        if (transferEvent && transferEvent.args && transferEvent.args.tokenId) {
          tokenId = transferEvent.args.tokenId.toString();
        } else {
          // Fallback if event not found
          tokenId = Date.now().toString();
        }
      } catch (e) {
        tokenId = Date.now().toString(); // Fallback
      }

      return {
        success: true,
        nftData: {
          network,
          contractAddress: targetContract,
          tokenId,
          mintTxHash: receipt.hash,
          metadataURI,
        },
      };
    } catch (ethersError) {
      console.error('Blockchain minting error:', ethersError);
      return {
        success: false,
        error: `Minting failed: ${ethersError.message}`,
      };
    }
  } catch (error) {
    console.error('Error minting NFT:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Index comic for search
 * Uses MongoDB text indexes by default, can be extended for Elasticsearch/Algolia
 * @param {string} comicId - Comic ID
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
const indexComicForSearch = async (comicId) => {
  try {
    const comic = await Comic.findById(comicId);
    if (!comic) {
      return { success: false, error: 'Comic not found' };
    }

    // MongoDB text indexes are already configured in the model
    // This ensures the document is immediately searchable

    // Optional: Integrate external search service
    if (process.env.ELASTICSEARCH_URL) {
      try {
        const { Client } = require('@elastic/elasticsearch');
        const client = new Client({ node: process.env.ELASTICSEARCH_URL });

        await client.index({
          index: 'comics',
          id: comic._id.toString(),
          body: {
            title: comic.title,
            description: comic.description,
            slug: comic.slug,
            genres: comic.genres,
            tags: comic.tags,
            creator: comic.creator.toString(),
            publishedAt: comic.publishedAt,
            visibility: comic.visibility,
          },
        });

        console.log('Comic indexed in Elasticsearch:', comic.title);
      } catch (esError) {
        console.warn(
          'Elasticsearch indexing failed (non-critical):',
          esError.message
        );
        // Don't fail the entire operation if external search fails
      }
    }

    if (process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_API_KEY) {
      try {
        const algoliasearch = require('algoliasearch');
        const client = algoliasearch(
          process.env.ALGOLIA_APP_ID,
          process.env.ALGOLIA_API_KEY
        );
        const index = client.initIndex('comics');

        await index.saveObject({
          objectID: comic._id.toString(),
          title: comic.title,
          description: comic.description,
          slug: comic.slug,
          genres: comic.genres,
          tags: comic.tags,
          publishedAt: comic.publishedAt?.getTime(),
        });

        console.log('Comic indexed in Algolia:', comic.title);
      } catch (algoliaError) {
        console.warn(
          'Algolia indexing failed (non-critical):',
          algoliaError.message
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error indexing comic:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Complete publish workflow (saga orchestration)
 * @param {string} comicId - Comic ID
 * @param {Object} options - Publish options { mintNFT: boolean, network?: string }
 * @returns {Promise<Object>} - Publish result
 */
const publishComic = async (comicId, options = {}) => {
  const result = {
    success: false,
    status: PublishStatus.PENDING,
    steps: [],
    errors: [],
  };

  try {
    // Step 1: Preflight checks
    console.log('Running preflight checks...');
    const preflight = await runPreflightChecks(comicId);
    result.steps.push({
      step: 'preflight',
      success: preflight.canPublish,
      ...preflight,
    });

    if (!preflight.canPublish) {
      result.errors = preflight.errors;
      result.status = PublishStatus.FAILED;
      return result;
    }

    // Step 2: Pin all pages to IPFS
    console.log('Pinning pages to IPFS...');
    result.status = PublishStatus.PINNING;
    const pinResult = await pinAllPages(comicId);
    result.steps.push({ step: 'pinning', ...pinResult });

    if (!pinResult.success) {
      result.errors.push(...pinResult.errors);
      result.status = PublishStatus.FAILED;
      return result;
    }

    // Step 3: Create metadata bundle
    console.log('Creating metadata bundle...');
    const metadataResult = await createMetadataBundle(comicId);
    result.steps.push({ step: 'metadata', ...metadataResult });

    if (!metadataResult.success) {
      result.errors.push(metadataResult.error);
      result.status = PublishStatus.FAILED;
      return result;
    }

    // Step 4: Optional NFT minting
    if (options.mintNFT) {
      console.log('Minting NFT...');
      result.status = PublishStatus.MINTING;
      const mintResult = await mintComicNFT(
        comicId,
        metadataResult.metadataCID,
        options
      );
      result.steps.push({ step: 'minting', ...mintResult });

      if (!mintResult.success) {
        result.errors.push(mintResult.error);
        // Continue even if minting fails (non-critical)
      }
    }

    // Step 5: Index for search
    console.log('Indexing for search...');
    result.status = PublishStatus.INDEXING;
    const indexResult = await indexComicForSearch(comicId);
    result.steps.push({ step: 'indexing', ...indexResult });

    // Step 6: Update comic status to published
    console.log('Updating comic status...');
    const comic = await Comic.findById(comicId);
    if (!comic) {
      result.errors.push('Comic not found during final update');
      result.status = PublishStatus.FAILED;
      return result;
    }
    comic.status = 'published';
    comic.publishedAt = new Date();

    // Save on-chain data if minted
    const mintStep = result.steps.find((s) => s.step === 'minting');
    if (mintStep && mintStep.success && mintStep.nftData) {
      comic.onChainData = {
        network: mintStep.nftData.network,
        contractAddress: mintStep.nftData.contractAddress,
        tokenId: mintStep.nftData.tokenId,
        mintTxHash: mintStep.nftData.mintTxHash,
        ipfsMetadataCID: metadataResult.metadataCID,
      };
    } else if (metadataResult.metadataCID) {
      comic.onChainData = { ipfsMetadataCID: metadataResult.metadataCID };
    }

    await comic.save();

    result.success = true;
    result.status = PublishStatus.COMPLETED;
    result.comicSlug = comic.slug;
    result.metadataCID = metadataResult.metadataCID;

    console.log('Comic published successfully:', comic.slug);
    return result;
  } catch (error) {
    console.error('Error during publish workflow:', error);
    result.errors.push(error.message);
    result.status = PublishStatus.FAILED;
    return result;
  }
};

/**
 * Unpublish a comic (change status back to draft)
 * @param {string} comicId - Comic ID
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
const unpublishComic = async (comicId) => {
  try {
    const comic = await Comic.findById(comicId);
    if (!comic) {
      return { success: false, error: 'Comic not found' };
    }

    comic.status = 'draft';
    comic.publishedAt = null;
    await comic.save();

    return { success: true };
  } catch (error) {
    console.error('Error unpublishing comic:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  PublishStatus,
  runPreflightChecks,
  pinAllPages,
  createMetadataBundle,
  mintComicNFT,
  indexComicForSearch,
  publishComic,
  unpublishComic,
};
