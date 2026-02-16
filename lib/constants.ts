/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: 'GroqTales',
  description: 'AI-Powered Web3 Storytelling Platform',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://groqtales.com',
  supportEmail: 'support@groqtales.com',
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  retryAttempts: 3,
  endpoints: {
    auth: '/auth',
    users: '/users',
    stories: '/stories',
    nfts: '/nfts',
    transactions: '/transactions',
  },
} as const;

/**
 * Blockchain configuration
 */
export const BLOCKCHAIN_CONFIG = {
  networks: {
    mainnet: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      symbol: 'ETH',
      rpcUrl: process.env.NEXT_PUBLIC_ETH_RPC_URL || '',
      explorerUrl: 'https://etherscan.io',
    },
    monad: {
      chainId: 41414,
      name: 'Monad Testnet',
      symbol: 'MON',
      rpcUrl: process.env.NEXT_PUBLIC_MONAD_RPC_URL || '',
      explorerUrl: 'https://explorer.monad.xyz',
    },
  },
  contracts: {
    storyNFT: process.env.NEXT_PUBLIC_STORY_NFT_CONTRACT || '',
    marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || '',
  },
  supportedWallets: ['metamask', 'walletconnect', 'coinbase'],
} as const;

/**
 * Story configuration
 */
export const STORY_CONFIG = {
  maxLength: {
    title: 100,
    excerpt: 300,
    content: 50000,
    bio: 500,
  },
  genres: [
    'Fantasy',
    'Science Fiction',
    'Mystery',
    'Romance',
    'Thriller',
    'Horror',
    'Adventure',
    'Drama',
    'Comedy',
    'Historical Fiction',
    'Contemporary',
    'Young Adult',
    'Children',
    'Non-Fiction',
  ],
  contentWarnings: [
    'Violence',
    'Sexual Content',
    'Language',
    'Drug Use',
    'Mental Health',
    'Death',
    'Trauma',
  ],
  difficulties: ['beginner', 'intermediate', 'advanced'],
  types: ['text', 'visual', 'comic', 'interactive'],
} as const;

/**
 * NFT configuration
 */
export const NFT_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  supportedVideoTypes: ['video/mp4', 'video/webm', 'video/mov'],
  minPrice: 0.001, // ETH
  maxPrice: 1000, // ETH
  defaultRoyalty: 10, // 10%
  maxRoyalty: 50, // 50%
  attributes: {
    maxCount: 20,
    maxNameLength: 50,
    maxValueLength: 100,
  },
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  zIndex: {
    dropdown: 1000,
    modal: 1050,
    tooltip: 1100,
    toast: 1200,
  },
} as const;

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  enableComments: true,
  enableRatings: true,
  enableSharing: true,
  enableCollaborations: false,
  enableRemixing: false,
  enableTipping: false,
  enableSubscriptions: false,
  enablePremiumContent: false,
} as const;

/**
 * External service URLs
 */
export const EXTERNAL_URLS = {
  documentation: 'https://docs.groqtales.com',
  github: 'https://github.com/groqtales/groqtales',
  discord: 'https://discord.gg/groqtales',
  twitter: 'https://twitter.com/groqtales',
  medium: 'https://medium.com/@groqtales',
} as const;

/**
 * File upload configuration
 */
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    image: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    document: ['pdf', 'doc', 'docx', 'txt'],
  },
  storage: {
    provider: 'ipfs', // or 's3', 'cloudinary', etc.
    bucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || '',
  },
} as const;

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  ttl: {
    short: 5 * 60, // 5 minutes
    medium: 30 * 60, // 30 minutes
    long: 24 * 60 * 60, // 24 hours
  },
  keys: {
    user: 'user',
    stories: 'stories',
    nfts: 'nfts',
    trending: 'trending',
  },
} as const;

/**
 * Analytics configuration
 */
export const ANALYTICS_CONFIG = {
  googleAnalytics: process.env.NEXT_PUBLIC_GA_ID || '',
  mixpanel: process.env.NEXT_PUBLIC_MIXPANEL_ID || '',
  hotjar: process.env.NEXT_PUBLIC_HOTJAR_ID || '',
  events: {
    storyCreated: 'story_created',
    storyViewed: 'story_viewed',
    storyLiked: 'story_liked',
    nftMinted: 'nft_minted',
    nftPurchased: 'nft_purchased',
    userSignedUp: 'user_signed_up',
  },
} as const;

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  walletAddress: /^0x[a-fA-F0-9]{40}$/,
  url: /^https?:\/\/.+/,
  hashtag: /^#[a-zA-Z0-9_]+$/,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  general: {
    networkError: 'Network error. Please check your connection and try again.',
    unexpectedError: 'An unexpected error occurred. Please try again.',
    unauthorized: 'You are not authorized to perform this action.',
    notFound: 'The requested resource was not found.',
    rateLimited: 'Too many requests. Please try again later.',
  },
  validation: {
    required: 'This field is required.',
    invalidEmail: 'Please enter a valid email address.',
    invalidUsername:
      'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens.',
    invalidWalletAddress: 'Please enter a valid wallet address.',
    invalidUrl: 'Please enter a valid URL.',
    fileTooLarge: 'File size exceeds the maximum limit.',
    invalidFileType: 'File type is not supported.',
  },
  wallet: {
    notConnected: 'Please connect your wallet first.',
    wrongNetwork: 'Please switch to the correct network.',
    insufficientBalance: 'Insufficient balance for this transaction.',
    transactionFailed: 'Transaction failed. Please try again.',
    userRejected: 'Transaction was rejected by user.',
  },
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  story: {
    created: 'Story created successfully!',
    updated: 'Story updated successfully!',
    deleted: 'Story deleted successfully!',
    published: 'Story published successfully!',
  },
  nft: {
    minted: 'NFT minted successfully!',
    listed: 'NFT listed for sale successfully!',
    purchased: 'NFT purchased successfully!',
    transferred: 'NFT transferred successfully!',
  },
  user: {
    profileUpdated: 'Profile updated successfully!',
    passwordChanged: 'Password changed successfully!',
    emailVerified: 'Email verified successfully!',
  },
  wallet: {
    connected: 'Wallet connected successfully!',
    disconnected: 'Wallet disconnected successfully!',
    networkSwitched: 'Network switched successfully!',
  },
} as const;

export default {};
