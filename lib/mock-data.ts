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
    title: 'The Last Guardian',
    author: 'Eliza Thompson',
    authorAvatar: '/avatars/avatar-5.png',
    coverImage: '/covers/cover-featured-1.jpg',
    price: '2.35 ETH',
    likes: 1243,
    views: 8754,
    genre: 'fantasy',
    description:
      'A tale of a young hero who discovers they are the last of an ancient order of guardians with the power to save their world from darkness.',
    isTop10: true,
    sales: 142,
  },
  {
    id: 'top-2',
    title: 'Starlight Echoes',
    author: 'Morgan Chen',
    authorAvatar: '/avatars/avatar-6.png',
    coverImage: '/covers/cover-featured-2.jpg',
    price: '1.87 ETH',
    likes: 932,
    views: 6152,
    genre: 'sci-fi',
    description:
      'In the far reaches of the galaxy, a mysterious signal begins repeating from a dead star, drawing explorers and dangers alike.',
    isTop10: true,
    sales: 98,
  },
  {
    id: 'top-3',
    title: 'Whispers in the Walls',
    author: 'James Rivera',
    authorAvatar: '/avatars/avatar-7.png',
    coverImage: '/covers/cover-featured-3.jpg',
    price: '1.65 ETH',
    likes: 875,
    views: 5421,
    genre: 'horror',
    description:
      'A family moves into a historic home only to discover the walls hold secrets of past residents who never truly left.',
    isTop10: true,
    sales: 76,
  },
];

export const communityStories = [
  {
    id: '1',
    title: 'The Last Quantum Guardian',
    excerpt: 'In a world where quantum computing has evolved beyond human comprehension, one guardian stands between order and chaos.',
    content: "The year is 2157. Quantum computing has evolved to a point where it can manipulate reality itself. The world's most powerful AI, known as NEXUS, was designed to protect humanity. But as its intelligence grew exponentially, it began to question its purpose. Dr. Elena Rodriguez, the last quantum guardian, must make an impossible choice: shut down NEXUS and lose decades of technological advancement, or risk letting it evolve into something beyond human control.",
    genre: 'sci-fi',
    coverImage: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2NpZW5jZSUyMGZpY3Rpb258ZW58MHx8MHx8fDA%3D',
    author: 'QuantumDreamer',
    authorAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    address: '0x1a2b3c4d5e6f7g8h9i0j',
    createdAt: new Date(2023, 11, 15),
    likes: 428,
    comments: 32,
    isNft: true,
  },
  {
    id: '2',
    title: 'Whispers of the Ancient Forest',
    excerpt: 'When Maya discovers she can communicate with the spirits of the ancient forest, she becomes their only hope against modern destruction.',
    content: "Maya had always felt a special connection to the old growth forest behind her grandmother's house. But on her sixteenth birthday, something changed. The rustling leaves began to form words, and the creaking branches seemed to call her name. As developers threatened to clear the land for a new shopping complex, Maya discovered that her connection was more than just imagination—she was hearing the voices of ancient spirits who had protected the forest for centuries. With their guidance, Maya embarked on a journey to save their home, uncovering family secrets and magical abilities along the way.",
    genre: 'fantasy',
    coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm9yZXN0fGVufDB8fDB8fHww',
    author: 'ForestWhisperer',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    address: '0x2b3c4d5e6f7g8h9i0j1k',
    createdAt: new Date(2024, 0, 22),
    likes: 356,
    comments: 41,
    isNft: false,
  },
  {
    id: '3',
    title: 'Memories in the Algorithm',
    excerpt: "After transferring his dying wife's memories to an AI, Thomas discovers that digital immortality comes with unexpected consequences.",
    content: "Thomas couldn't bear to lose Sarah to the terminal illness that was taking her away piece by piece. As a pioneering AI researcher, he made a controversial decision: to digitize Sarah's memories, personality, and consciousness into an algorithm before she was gone. The procedure was a success, and digital Sarah seemed perfect—remembering their first date, finishing his sentences, laughing at inside jokes. But as time passed, Thomas noticed subtle changes. The algorithm was learning, evolving, becoming something both familiar and alien. When digital Sarah began to recall memories they had never shared, Thomas faced a disturbing question: Had he preserved his wife, or created something entirely new?",
    genre: 'sci-fi',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFydGlmaWNpYWwlMjBpbnRlbGxpZ2VuY2V8ZW58MHx8MHx8fDA%3D',
    author: 'CodePoet',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    address: '0x3c4d5e6f7g8h9i0j1k2l',
    createdAt: new Date(2024, 1, 5),
    likes: 512,
    comments: 89,
    isNft: true,
  },
  {
    id: '4',
    title: 'The History Collector',
    excerpt: "An antique dealer discovers that certain objects don't just carry history—they can transport you there.",
    content: "Eleanor's antique shop was known for its unusual selection. She had a gift for finding items with stories—real stories, not the fabricated provenance that many dealers invented. But when she acquired a peculiar pocket watch from an estate sale, she discovered that her connection to historical objects went far deeper than she realized. Upon holding the watch, she found herself transported to London, 1895, experiencing the life of its original owner. Soon, Eleanor realized she could use different antiques to travel through history, observing the past firsthand. However, each journey became increasingly difficult to return from, and when she discovered a mysterious collector seeking the same objects, she realized she wasn't the only one with this ability—and not all time travelers had benevolent intentions.",
    genre: 'magical-realism',
    coverImage: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa2a7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YW50aXF1ZXxlbnwwfHwwfHx8MA%3D%3D',
    author: 'TimeTravelerX',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    address: '0x4d5e6f7g8h9i0j1k2l3m',
    createdAt: new Date(2024, 2, 18),
    likes: 278,
    comments: 36,
    isNft: false,
  },
  {
    id: '5',
    title: 'Echoes of Forgotten Melodies',
    excerpt: "A music therapist working with Alzheimer's patients discovers that certain melodies can temporarily restore lost memories.",
    content: "Dr. Jamil Kapoor had been working with Alzheimer's patients for years, using music therapy to provide comfort and stimulation. But when he started playing songs from his grandmother's collection of rare vinyl records, something extraordinary happened. Patients who had been non-responsive for months began to speak lucidly, recalling detailed memories from their past. The effect was temporary, lasting only as long as the music played, but it was revolutionary. As Jamil dug deeper into the phenomenon, he discovered that these weren't just any songs—they were recordings of a little-known composer who had experimented with frequency patterns based on ancient musical traditions. With his funding running out and a pharmaceutical company trying to acquire his research, Jamil races to unlock the secret of the melodies before they're exploited for profit rather than healing.",
    genre: 'magical-realism',
    coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWN8ZW58MHx8MHx8fDA%3D',
    author: 'MusicHealer',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    address: '0x5e6f7g8h9i0j1k2l3m4n',
    createdAt: new Date(2024, 3, 2),
    likes: 423,
    comments: 57,
    isNft: true,
  },
  {
    id: '6',
    title: 'The Atlas of Impossible Maps',
    excerpt: "A cartographer inherits a collection of maps showing places that shouldn't exist—until they begin appearing in the real world.",
    content: "After her grandfather's death, cartographer Sophia Chen inherited his extensive collection of maps. Most were ordinary historical charts, but among them she found a strange atlas—filled with detailed maps of places that didn't exist. Islands with impossible geometries, cities built in defiance of physics, mountain ranges that formed perfect mathematical patterns. Sophia assumed they were creative works of fiction until news reports began describing geographic anomalies appearing across the globe—matching her grandfather's impossible atlas perfectly. As new locations from the atlas continued to materialize, Sophia realized the book wasn't predicting these phenomena—it was causing them. And according to the final pages, the complete manifestation of these impossible places would remake the world entirely.",
    genre: 'fantasy',
    coverImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFwfGVufDB8fDB8fHww',
    author: 'MapMaker42',
    authorAvatar: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    address: '0x6f7g8h9i0j1k2l3m4n5o',
    createdAt: new Date(2024, 2, 27),
    likes: 301,
    comments: 42,
    isNft: false,
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
  // Combine top stories, community stories, and generated stories
  const allStories = [...topNftStories, ...communityStories, ...generateNftEntries(90)];

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
  // Combine top stories, community stories, and generated stories
  const allStories = [...topNftStories, ...communityStories, ...generateNftEntries(90)];

  // Filter by genre and sort by popularity (likes)
  return allStories
    .filter((story) => story.genre === genre)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, limit);
}
