import axios from 'axios';

// Pinata API endpoints
const PINATA_BASE_URL = 'https://api.pinata.cloud';
const PINATA_PIN_FILE_ENDPOINT = `${PINATA_BASE_URL}/pinning/pinFileToIPFS`;
const PINATA_JSON_ENDPOINT = `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`;

// Get Pinata credentials from environment variables
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

// IPFS Gateway URLs for accessing content
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

/**
 * Uploads a file to IPFS using Pinata
 * @param file The file or data to upload
 * @param metadata Optional metadata for the file
 * @returns The IPFS hash (CID) of the uploaded file
 */
export const uploadToIPFS = async (
  file: File | string | object,
  metadata?: Record<string, any>
): Promise<string> => {
  if (process.env.NODE_ENV === 'development')
    console.log('Uploading to IPFS:', typeof file, metadata);

  // If we don't have API keys, use mock implementation for development
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    console.warn(
      'Using mock IPFS upload as Pinata API credentials are not set'
    );
    return mockUploadToIPFS(file, metadata);
  }

  try {
    // If the input is an object, use the JSON endpoint
    if (
      typeof file === 'object' &&
      !(file instanceof File) &&
      !(file instanceof Blob)
    ) {
      return uploadJSONToIPFS(file, metadata);
    }

    const formData = new FormData();

    if (typeof file === 'string') {
      // If string, treat as content to be converted to Blob
      formData.append(
        'file',
        new Blob([file], { type: 'text/plain' }),
        'content.txt'
      );
    } else {
      // If File, append directly
      formData.append('file', file);
    }

    // Add metadata if provided
    if (metadata) {
      formData.append(
        'pinataMetadata',
        JSON.stringify({
          name: metadata.name || 'GroqTales Content',
          ...metadata,
        })
      );
    }

    // Add options for better pinning
    formData.append(
      'pinataOptions',
      JSON.stringify({
        cidVersion: 1,
        wrapWithDirectory: false,
      })
    );

    if (process.env.NODE_ENV === 'development')
      console.log('Sending request to Pinata...');
    const response = await axios.post(PINATA_PIN_FILE_ENDPOINT, formData, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });

    if (response.data && response.data.IpfsHash) {
      if (process.env.NODE_ENV === 'development')
        console.log('Successfully uploaded to IPFS:', response.data.IpfsHash);
      return response.data.IpfsHash;
    } else {
      if (process.env.NODE_ENV === 'development')
        console.error('Invalid Pinata response:', response.data);
      throw new Error('Failed to get IPFS hash from Pinata response');
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development')
      console.error('Error uploading to IPFS via Pinata:', error);

    // If axios error, provide more details
    if (error.response) {
      if (process.env.NODE_ENV === 'development')
        console.error('Pinata error response:', error.response.data);
      throw new Error(
        `Pinata API error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    }

    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

/**
 * Upload JSON data directly to IPFS
 */
const uploadJSONToIPFS = async (
  jsonData: object,
  metadata?: Record<string, any>
): Promise<string> => {
  try {
    const pinataBody = {
      pinataContent: jsonData,
      pinataMetadata: metadata
        ? {
            name: metadata.name || 'GroqTales JSON',
            ...metadata,
          }
        : undefined,
      pinataOptions: {
        cidVersion: 1,
      },
    };

    const response = await axios.post(PINATA_JSON_ENDPOINT, pinataBody, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
        'Content-Type': 'application/json',
      },
    });

    if (response.data && response.data.IpfsHash) {
      if (process.env.NODE_ENV === 'development')
        console.log(
          'Successfully uploaded JSON to IPFS:',
          response.data.IpfsHash
        );
      return response.data.IpfsHash;
    } else {
      if (process.env.NODE_ENV === 'development')
        console.error('Invalid Pinata JSON response:', response.data);
      throw new Error('Failed to get IPFS hash from Pinata JSON response');
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development')
      console.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
};

/**
 * Mock implementation for when API keys aren't available
 */
const mockUploadToIPFS = async (
  file: File | string | object,
  metadata?: Record<string, any>
): Promise<string> => {
  if (process.env.NODE_ENV === 'development')
    console.log('Using mock IPFS upload');

  // Create a deterministic but random-looking hash based on content
  let content = '';
  if (typeof file === 'string') {
    content = file;
  } else if (file instanceof File) {
    content = file.name + file.size + file.type;
  } else {
    content = JSON.stringify(file);
  }

  // Create a hash-like string from the content
  const hash = Array.from(content)
    .reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0)
    .toString(16)
    .replace('-', '');

  // Format as a realistic IPFS CID
  const mockCid = `Qm${hash.padStart(44, '0')}`;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (process.env.NODE_ENV === 'development')
    console.log('Mock IPFS upload successful:', mockCid);
  return mockCid;
};

/**
 * Constructs a gateway URL for accessing IPFS content
 * @param cid The Content Identifier (IPFS hash)
 * @returns A URL to access the content via IPFS gateway
 */
export const getIPFSUrl = (cid: string): string => {
  // Use the primary gateway
  return `${IPFS_GATEWAYS[0]}${cid}`;
};

/**
 * Get alternative gateway URLs for the same content
 * Useful for fallbacks if one gateway is down
 */
export const getIPFSFallbackUrls = (cid: string): string[] => {
  return IPFS_GATEWAYS.map((gateway) => `${gateway}${cid}`);
};
