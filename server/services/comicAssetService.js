const axios = require('axios');
const FormData = require('form-data');

// Pinata configuration
const PINATA_BASE_URL = 'https://api.pinata.cloud';
const PINATA_PIN_FILE_ENDPOINT = `${PINATA_BASE_URL}/pinning/pinFileToIPFS`;
const PINATA_JSON_ENDPOINT = `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
// if (!PINATA_API_KEY || !PINATA_API_SECRET) {
//   throw new Error(
//     'Pinata API credentials (PINATA_API_KEY and PINATA_API_SECRET) must be set in the environment'
//   );
// }
// Ensure both are set for all environments

// IPFS Gateway URLs
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

/**
 * Validates image file type and size
 * @param {Buffer} buffer - Image buffer
 * @param {string} mimeType - MIME type of the image
 * @returns {Object} - Validation result { valid: boolean, error?: string }
 */
const validateImage = (buffer, mimeType) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 20 * 1024 * 1024; // 20MB

  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid image type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  if (buffer.length > maxSize) {
    return {
      valid: false,
      error: `Image size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  return { valid: true };
};

/**
 * Generate responsive image variants using Sharp (optional - requires sharp package)
 * Falls back to original if sharp is not available
 * @param {Buffer} buffer - Original image buffer
 * @param {string} mimeType - MIME type
 * @returns {Object} - Variants { original, thumb, web, hd }
 */
const generateImageVariants = async (buffer, mimeType) => {
  try {
    // Try to use sharp if available
    const sharp = require('sharp');

    const variants = {
      original: buffer,
      thumb: await sharp(buffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .toBuffer(),
      web: await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .toBuffer(),
      hd: await sharp(buffer)
        .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
        .toBuffer(),
    };

    return variants;
  } catch (error) {
    // If sharp is not installed or fails, return original for all variants
    console.warn(
      'Sharp not available, using original image for all variants:',
      error.message
    );
    return {
      original: buffer,
      thumb: buffer,
      web: buffer,
      hd: buffer,
    };
  }
};

/**
 * Get image dimensions (requires sharp)
 * @param {Buffer} buffer - Image buffer
 * @returns {Object} - { width, height } or null
 */
const getImageDimensions = async (buffer) => {
  try {
    const sharp = require('sharp');
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    console.warn('Could not get image dimensions:', error.message);
    return null;
  }
};

/**
 * Upload a buffer to IPFS via Pinata
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {Object} metadata - Pinata metadata
 * @returns {Promise<string>} - IPFS CID
 */
const uploadBufferToIPFS = async (buffer, filename, metadata = {}) => {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error('Pinata API credentials not configured');
  }

  const formData = new FormData();
  formData.append('file', buffer, { filename });

  if (metadata) {
    formData.append(
      'pinataMetadata',
      JSON.stringify({
        name: metadata.name || filename,
        keyvalues: metadata.keyvalues || {},
      })
    );
  }

  formData.append(
    'pinataOptions',
    JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: false,
    })
  );

  try {
    const response = await axios.post(PINATA_PIN_FILE_ENDPOINT, formData, {
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000, // 60 second timeout for large files
    });

    if (response.data && response.data.IpfsHash) {
      return response.data.IpfsHash;
    } else {
      throw new Error('Failed to get IPFS hash from Pinata response');
    }
  } catch (error) {
    console.error('Error uploading to IPFS:', error.message);
    if (error.response) {
      throw new Error(
        `Pinata API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    }
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

/**
 * Upload JSON data to IPFS via Pinata
 * @param {Object} jsonData - JSON object to upload
 * @param {Object} metadata - Pinata metadata
 * @returns {Promise<string>} - IPFS CID
 */
const uploadJSONToIPFS = async (jsonData, metadata = {}) => {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error('Pinata API credentials not configured');
  }

  const pinataBody = {
    pinataContent: jsonData,
    pinataMetadata: metadata
      ? {
          name: metadata.name || 'GroqTales Comic Metadata',
          keyvalues: metadata.keyvalues || {},
        }
      : undefined,
    pinataOptions: {
      cidVersion: 1,
    },
  };

  try {
    const response = await axios.post(PINATA_JSON_ENDPOINT, pinataBody, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    if (response.data && response.data.IpfsHash) {
      return response.data.IpfsHash;
    } else {
      throw new Error('Failed to get IPFS hash from Pinata JSON response');
    }
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error.message);
    if (error.response) {
      throw new Error(
        `Pinata API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    }
    throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
  }
};

/**
 * Get gateway URL for IPFS CID
 * @param {string} cid - IPFS CID
 * @param {number} gatewayIndex - Index of gateway to use (default: 0)
 * @returns {string} - Gateway URL
 */
const getGatewayURL = (cid, gatewayIndex = 0) => {
  if (!cid) return null;
  return `${IPFS_GATEWAYS[gatewayIndex]}${cid}`;
};

/**
 * Get all gateway URLs for a CID (for fallback)
 * @param {string} cid - IPFS CID
 * @returns {{ original: string[], thumb: string[], web: string[], hd: string[] } | null} - Gateway URLs for each asset type, each as an array of fallback URLs
 */
const getAllGatewayURLs = (cid) => {
  if (!cid) return null;
  return {
    original: IPFS_GATEWAYS.map((_, i) => getGatewayURL(cid, i)),
    thumb: IPFS_GATEWAYS.map((_, i) => getGatewayURL(cid, i)),
    web: IPFS_GATEWAYS.map((_, i) => getGatewayURL(cid, i)),
    hd: IPFS_GATEWAYS.map((_, i) => getGatewayURL(cid, i)),
  };
};

/**
 * Process and upload comic page image with variants
 * @param {Buffer} buffer - Original image buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - MIME type
 * @param {Object} metadata - Additional metadata (comicId, pageNumber, etc.)
 * @returns {Promise<Object>} - Image asset object with CIDs and gateway URLs
 */
const processAndUploadPageImage = async (
  buffer,
  filename,
  mimeType,
  metadata = {}
) => {
  // Validate image
  const validation = validateImage(buffer, mimeType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get dimensions
  const dimensions = await getImageDimensions(buffer);

  // Generate variants
  const variants = await generateImageVariants(buffer, mimeType);

  // Upload all variants to IPFS
  const uploadPromises = {
    original: uploadBufferToIPFS(variants.original, filename, {
      name: `${metadata.comicId}_page_${metadata.pageNumber}_original`,
      keyvalues: {
        comicId: metadata.comicId || '',
        pageNumber: metadata.pageNumber || '',
        variant: 'original',
      },
    }),
    thumb: uploadBufferToIPFS(variants.thumb, `thumb_${filename}`, {
      name: `${metadata.comicId}_page_${metadata.pageNumber}_thumb`,
      keyvalues: {
        comicId: metadata.comicId || '',
        pageNumber: metadata.pageNumber || '',
        variant: 'thumb',
      },
    }),
    web: uploadBufferToIPFS(variants.web, `web_${filename}`, {
      name: `${metadata.comicId}_page_${metadata.pageNumber}_web`,
      keyvalues: {
        comicId: metadata.comicId || '',
        pageNumber: metadata.pageNumber || '',
        variant: 'web',
      },
    }),
    hd: uploadBufferToIPFS(variants.hd, `hd_${filename}`, {
      name: `${metadata.comicId}_page_${metadata.pageNumber}_hd`,
      keyvalues: {
        comicId: metadata.comicId || '',
        pageNumber: metadata.pageNumber || '',
        variant: 'hd',
      },
    }),
  };

  const cids = await Promise.all([
    uploadPromises.original,
    uploadPromises.thumb,
    uploadPromises.web,
    uploadPromises.hd,
  ]);

  return {
    originalCID: cids[0],
    thumbCID: cids[1],
    webCID: cids[2],
    hdCID: cids[3],
    gatewayURLs: {
      original: getGatewayURL(cids[0]),
      thumb: getGatewayURL(cids[1]),
      web: getGatewayURL(cids[2]),
      hd: getGatewayURL(cids[3]),
    },
    dimensions,
    fileSize: buffer.length,
    mimeType,
  };
};

/**
 * Create and upload comic metadata bundle for NFT minting
 * @param {Object} comic - Comic document
 * @param {Array} pages - Array of page documents
 * @returns {Promise<string>} - Metadata CID
 */
const createAndUploadMetadataBundle = async (comic, pages) => {
  const metadata = {
    name: comic.title,
    description: comic.description,
    image: comic.coverImage?.gatewayURL || '',
    attributes: [
      { trait_type: 'Genres', value: comic.genres.join(', ') },
      { trait_type: 'Language', value: comic.language },
      { trait_type: 'Pages', value: pages.length },
      { trait_type: 'Age Rating', value: comic.ageRating },
      { trait_type: 'Reading Direction', value: comic.readingDirection },
    ],
    properties: {
      creator: comic.creator.toString(),
      totalPages: pages.length,
      pages: pages.map((page) => ({
        pageNumber: page.pageNumber,
        image: page.imageAsset?.gatewayURLs?.original || '',
        altText: page.altText,
        transcript: page.transcript || '',
      })),
    },
    external_url: `https://groqtales.com/comics/${comic.slug}`,
  };

  const cid = await uploadJSONToIPFS(metadata, {
    name: `${comic.slug}_metadata`,
    keyvalues: {
      comicId: comic._id.toString(),
      type: 'comic_metadata',
    },
  });

  return cid;
};

module.exports = {
  validateImage,
  generateImageVariants,
  getImageDimensions,
  uploadBufferToIPFS,
  uploadJSONToIPFS,
  getGatewayURL,
  getAllGatewayURLs,
  processAndUploadPageImage,
  createAndUploadMetadataBundle,
};
