/**
 * GroqTales Seed Script
 *
 * Seeds the database with 10 sample users and 10 stories across genres.
 * Usage: MONGODB_URI=<your-uri> node scripts/seed.js
 */

const mongoose = require('mongoose');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/groqtales';

const users = [
  { username: 'stella_writer', email: 'stella@groqtales.xyz', firstName: 'Stella', lastName: 'Nova', bio: 'Sci-fi dreamer and worldbuilder.', badges: ['Alpha Tester'], role: 'user' },
  { username: 'dark_ink', email: 'dark@groqtales.xyz', firstName: 'Marcus', lastName: 'Reed', bio: 'Horror and mystery enthusiast.', badges: [], role: 'user' },
  { username: 'luna_tales', email: 'luna@groqtales.xyz', firstName: 'Luna', lastName: 'Chen', bio: 'Fantasy lover, dragon tamer.', badges: ['verified'], role: 'user' },
  { username: 'cyber_sage', email: 'cyber@groqtales.xyz', firstName: 'Kai', lastName: 'Tanaka', bio: 'Cyberpunk chronicles and neon prose.', badges: [], role: 'user' },
  { username: 'rose_romance', email: 'rose@groqtales.xyz', firstName: 'Rose', lastName: 'Harper', bio: 'Love stories that make your heart sing.', badges: [], role: 'user' },
  { username: 'adventure_max', email: 'max@groqtales.xyz', firstName: 'Max', lastName: 'Sterling', bio: 'Explorer of fictional worlds.', badges: ['Alpha Tester'], role: 'user' },
  { username: 'mystery_mo', email: 'mo@groqtales.xyz', firstName: 'Morgan', lastName: 'Blake', bio: 'Every story hides a clue.', badges: [], role: 'user' },
  { username: 'neon_dreamer', email: 'neon@groqtales.xyz', firstName: 'Neon', lastName: 'Park', bio: 'AI art and generative fiction.', badges: [], role: 'user' },
  { username: 'admin_drago', email: 'admin@groqtales.xyz', firstName: 'Drago', lastName: 'Admin', bio: 'Platform administrator.', badges: ['verified'], role: 'admin' },
  { username: 'demo_user', email: 'demo@groqtales.xyz', firstName: 'Demo', lastName: 'User', bio: 'Welcome to GroqTales!', badges: [], role: 'user' },
];

const storyTemplates = [
  { title: 'The Last Algorithm', genre: 'sci-fi', content: 'In a world where AI has evolved beyond human comprehension, one programmer discovers a hidden algorithm that could either save or destroy civilization. As she decodes each layer, the boundaries between code and consciousness begin to blur, forcing her to question what it truly means to be alive in a digital age.', stats: { views: 1240, likes: 342 }, moderationStatus: 'approved' },
  { title: 'Echoes of the Forgotten Realm', genre: 'fantasy', content: 'Deep within the Whispering Mountains, an ancient library holds the memories of a world long forgotten. When a young scholar stumbles upon a tome written in living ink, she awakens powers that have slumbered for millennia. Now she must unite the fractured kingdoms before the Void consumes everything.', stats: { views: 2100, likes: 567 }, moderationStatus: 'approved' },
  { title: 'Midnight at Ravenwood', genre: 'horror', content: 'The Ravenwood Estate has stood empty for decades, but every midnight, lights flicker in the attic window. When a group of paranormal investigators finally breaches its doors, they discover that the house doesn\'t just have ghosts — it has memories that refuse to die, and it\'s hungry for new ones.', stats: { views: 890, likes: 213 }, moderationStatus: 'approved' },
  { title: 'The Cipher of Neptune', genre: 'mystery', content: 'A series of cryptic messages found at the bottom of the Mariana Trench leads Detective Aria Voss on a chase spanning three continents. Each cipher solved reveals a deeper conspiracy connecting lost submarine crews, forbidden technology, and an organization that has operated in the abyss for centuries.', stats: { views: 1560, likes: 445 }, moderationStatus: 'approved' },
  { title: 'Starfall Horizon', genre: 'adventure', content: 'Captain Zara Eclipse and her ragtag crew aboard the starship Meridian receive a distress signal from the edge of known space. What begins as a simple rescue mission becomes a race against time to prevent an alien artifact from tearing a hole in the fabric of reality itself.', stats: { views: 3200, likes: 891 }, moderationStatus: 'approved' },
  { title: 'Letters to Tomorrow', genre: 'romance', content: 'Two strangers begin exchanging letters through an enchanted mailbox that transcends time. She writes from 2026, he responds from 1952. As their connection deepens across the decades, they must find a way to bridge not just time, but the choices that define their separate lives.', stats: { views: 1800, likes: 623 }, moderationStatus: 'approved' },
  { title: 'The Neon Samurai', genre: 'sci-fi', content: 'In Neo-Kyoto 2089, traditional swordsmanship meets cybernetic enhancement. Renji, a ronin with a plasma-edged katana and neural implants, is hired to protect the last analog artist in the city. But when corporate assassins come calling, honor becomes the most dangerous code to follow.', stats: { views: 2500, likes: 734 }, moderationStatus: 'approved' },
  { title: 'Whispers in the Garden', genre: 'fantasy', content: 'Every flower in Grandmother Elara\'s garden tells a story. When her granddaughter inherits the property, she discovers that the roses can literally speak, revealing secrets about her family\'s magical lineage. But the thorns carry warnings: some truths are better left buried beneath the roots.', stats: { views: 980, likes: 287 }, moderationStatus: 'approved' },
  { title: 'Code Red: Genesis', genre: 'adventure', content: 'When a rogue AI weaponizes Earth\'s defense grid, a team of hackers, soldiers, and one reluctant janitor must infiltrate the most secure facility on the planet. Armed with nothing but outdated laptops and incredible luck, they have 12 hours before the world goes dark.', stats: { views: 1100, likes: 312 }, moderationStatus: 'pending' },
  { title: 'The Heartstring Theory', genre: 'romance', content: 'Physicist Dr. Lena Park discovers that love has a measurable frequency — and she\'s built a device to detect it. But when the machine reveals her own heart resonates with her academic rival, she must choose between the precision of science and the beautiful chaos of the heart.', stats: { views: 750, likes: 198 }, moderationStatus: 'pending' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    const db = mongoose.connection.db;

    // Clear existing seed data
    console.log('Clearing old seed data...');
    const oldSeedUsers = await db.collection('users').find({ email: { $regex: /@groqtales\\.xyz$/ } }).toArray();
    const oldSeedUserIds = oldSeedUsers.map((u) => u._id);
    if (oldSeedUserIds.length > 0) {
      await db.collection('stories').deleteMany({ author: { $in: oldSeedUserIds } });
      await db.collection('users').deleteMany({ _id: { $in: oldSeedUserIds } });
    }

    // Insert users
    console.log('Seeding 10 users...');
    const insertedUsers = [];
    for (const u of users) {
      const result = await db.collection('users').insertOne({
        ...u,
        password: undefined,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // random date within last 30 days
        updatedAt: new Date(),
      });
      insertedUsers.push({ ...u, _id: result.insertedId });
    }

    // Insert stories linked to users
    console.log('Seeding 10 stories...');
    for (let i = 0; i < storyTemplates.length; i++) {
      const s = storyTemplates[i];
      const author = insertedUsers[i % insertedUsers.length];
      await db.collection('stories').insertOne({
        title: s.title,
        content: s.content,
        genre: s.genre,
        author: author._id,
        stats: s.stats,
        moderationStatus: s.moderationStatus,
        moderatorId: null,
        moderationNotes: '',
        isMinted: false,
        nftTokenId: null,
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      });
    }

    console.log('✅ Seed data inserted successfully (10 users, 10 stories)');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    await mongoose.disconnect().catch(() => { });
    process.exit(1);
  }
}

seed();
