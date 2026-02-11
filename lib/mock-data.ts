/**
 * Mock data generation for stories and NFTs
 */

// Generate mock NFT stories data
export const generateNftEntries = (count: number) => {
  const genres = [
    'fantasy',
    'sci-fi',
    'horror',
    'romance',
    'adventure',
    'historical',
    'educational',
    'magical-realism',
  ];

  const authors = [
    {
      name: 'Alex Johnson',
      username: '@alexwrites',
      avatar: '/avatars/avatar-1.png',
    },
    {
      name: 'Sara Chen',
      username: '@sarastories',
      avatar: '/avatars/avatar-2.png',
    },
    {
      name: 'Marcus Lee',
      username: '@marcusworld',
      avatar: '/avatars/avatar-3.png',
    },
    {
      name: 'Emma Davis',
      username: '@emmacraft',
      avatar: '/avatars/avatar-4.png',
    },
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `story-${i + 1}`,
    title: `Story Title ${i + 1}`,
    author: authors[i % authors.length]!.name,
    authorUsername: authors[i % authors.length]!.username,
    authorAvatar: authors[i % authors.length]!.avatar,
    coverImage: `/covers/cover-${(i % 12) + 1}.jpg`,
    price: `${(Math.random() * 2 + 0.05).toFixed(2)} ETH`,
    likes: Math.floor(Math.random() * 500),
    views: Math.floor(Math.random() * 2000) + 100,
    genre: genres[i % genres.length],
    description: `This is a sample description for story #${i + 1
      }. It showcases the plot and themes of this interesting story.`,
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)
    ),
  }));
};

// Export top NFT stories for use in components
export const topNftStories = [
  {
    id: 'top-1',
    title: "The Last Dragon's Tale",
    author: 'Elena Stormweaver',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elena&backgroundColor=f3e8ff',
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop&q=80',
    price: '2.5 ETH',
    likes: 1247,
    views: 15420,
    genre: 'Epic Fantasy',
    description: 'An epic tale of the last dragon and the young mage destined to either save or destroy the realm. The ancient prophecies speak of a child born of fire and light, who would hold the fate of the dragons in their hands. As the last dragon sleeps in the heart of the volcano, the young mage Elena must embark on a journey across the floating isles to find the crystal heart before the shadows consume everything.',
    isTop10: true,
    sales: 156,
  },
  {
    id: 'top-2',
    title: 'Neon Shadows',
    author: 'Marcus Cyberpunk',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus&backgroundColor=e0f2fe',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop&q=80',
    price: '1.8 ETH',
    likes: 892,
    views: 12300,
    genre: 'Cyberpunk',
    description: 'A gritty cyberpunk noir set in Neo-Tokyo where memories are currency and identity is fluid. In a world where your thoughts can be traded for credits, Marcus, a low-level data courier, stumbles upon a memory file that could bring down the powerful Zenith Corporation. Chased by cyber-enhanced assassins and ghost-hacks, he must navigate the rain-soaked neon streets to find the one person who can decrypt the truth.',
    isTop10: true,
    sales: 89,
  },
  {
    id: 'top-3',
    title: 'The Quantum Paradox',
    author: 'Dr. Sarah Chen',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah&backgroundColor=fef3c7',
    coverImage: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=1200&fit=crop&q=80',
    price: '3.2 ETH',
    likes: 1456,
    views: 18750,
    genre: 'Hard Sci-Fi',
    description: 'A mind-bending exploration of quantum mechanics and parallel universes through the eyes of a brilliant physicist. When Dr. Sarah Chen successfully conducts the first large-scale quantum entanglement experiment, she discovers that her laboratory is no longer in the same universe she started in. Every decision she makes splits the reality further, and she must find the fundamental constant that will lead her back home before her own timeline vanishes into static.',
    isTop10: true,
    sales: 203,
  },
];

/**
 * Fetches a story by its ID
 */
export function fetchStoryById(
  id: string,
  limit?: number,
  relatedStories?: boolean
): any {
  // Combine top stories with generated stories
  const allStories = [...topNftStories, ...generateNftEntries(90)];

  // If we're looking for related stories
  if (relatedStories) {
    const story = allStories.find((story) => story.id === id);
    if (!story) return [];

    // Find stories of the same genre, excluding the current story
    return allStories
      .filter((s) => s.genre === story.genre && s.id !== id)
      .slice(0, limit || 4);
  }

  // Otherwise return the specific story
  return allStories.find((story) => story.id === id);
}

/**
 * Fetches popular stories by genre
 */
export function fetchPopularStoriesByGenre(
  genre: string,
  limit: number = 8
): any[] {
  // Combine top stories with generated stories
  const allStories = [...topNftStories, ...generateNftEntries(90)];

  // Filter by genre and sort by popularity (likes)
  return allStories
    .filter((story) => story.genre === genre)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, limit);
}
