import {
  Rocket,
  Heart,
  Skull,
  Sparkles,
  GraduationCap,
  Wand2,
  Landmark,
  Globe,
  Clock,
  Ghost,
  Baby,
  Laugh,
  Compass,
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata = {
  title: 'Story Genres | GroqTales',
  description:
    'Explore different story genres on GroqTales - from Science Fiction to Fantasy, Romance to Mystery, and everything in between',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://groqtales.com'),
};

// Genre data
const genreData = [
  {
    name: 'Science Fiction',
    icon: <Rocket className="h-5 w-5 text-blue-500" />,
    description:
      'Stories that explore futuristic concepts, advanced technology, space exploration, time travel, parallel universes, and scientific principles.',
    popularElements: ['AI', 'Space', 'Dystopia', 'Time Travel', 'Robots'],
    famousWorks: ['Dune', 'Neuromancer', 'The Three-Body Problem'],
  },
  {
    name: 'Fantasy',
    icon: <Wand2 className="h-5 w-5 text-purple-500" />,
    description:
      'Stories with magical elements, mythical creatures, supernatural powers, and worlds that operate on different laws of reality.',
    popularElements: [
      'Magic',
      'Dragons',
      'Quests',
      'Magical Creatures',
      'Chosen One',
    ],
    famousWorks: [
      'The Lord of the Rings',
      'A Song of Ice and Fire',
      'The Name of the Wind',
    ],
  },
  {
    name: 'Romance',
    icon: <Heart className="h-5 w-5 text-red-500" />,
    description:
      'Stories focused on romantic relationships, emotional development between characters, and the pursuit of love.',
    popularElements: [
      'Love Triangle',
      'First Love',
      'Forbidden Romance',
      'Second Chance',
      'Slow Burn',
    ],
    famousWorks: ['Pride and Prejudice', 'Outlander', 'The Notebook'],
  },
  {
    name: 'Horror',
    icon: <Skull className="h-5 w-5 text-gray-700" />,
    description:
      'Stories designed to frighten, scare, or disgust by creating feelings of dread, terror, and psychological distress.',
    popularElements: [
      'Ghosts',
      'Monsters',
      'Psychological',
      'Gore',
      'Supernatural',
    ],
    famousWorks: ['The Shining', 'Dracula', 'House of Leaves'],
  },
  {
    name: 'Mystery',
    icon: <Sparkles className="h-5 w-5 text-amber-500" />,
    description:
      'Stories centered around solving a crime, uncovering secrets, or explaining unusual events, often featuring detectives or amateur sleuths.',
    popularElements: [
      'Detective',
      'Whodunit',
      'Clues',
      'Suspense',
      'Plot Twist',
    ],
    famousWorks: [
      'Gone Girl',
      'The Girl with the Dragon Tattoo',
      'And Then There Were None',
    ],
  },
  {
    name: 'Historical Fiction',
    icon: <Landmark className="h-5 w-5 text-brown-500" />,
    description:
      'Stories set in the past that blend real historical events or settings with fictional elements and characters.',
    popularElements: [
      'War',
      'Romance',
      'Revolution',
      'Royalty',
      'Cultural Change',
    ],
    famousWorks: ['All the Light We Cannot See', 'Wolf Hall', 'The Book Thief'],
  },
  {
    name: 'Adventure',
    icon: <Compass className="h-5 w-5 text-green-600" />,
    description:
      'Stories focused on exciting journeys, quests, and expeditions, often featuring physical challenges and discoveries.',
    popularElements: [
      'Quest',
      'Travel',
      'Treasure Hunt',
      'Survival',
      'Exploration',
    ],
    famousWorks: [
      'The Hobbit',
      'Treasure Island',
      'Journey to the Center of the Earth',
    ],
  },
  {
    name: 'Young Adult',
    icon: <Baby className="h-5 w-5 text-pink-500" />,
    description:
      'Stories targeting teenage readers, often dealing with coming-of-age issues, identity, relationships, and social challenges.',
    popularElements: [
      'Coming of Age',
      'First Love',
      'Identity',
      'Friendship',
      'School',
    ],
    famousWorks: ['The Hunger Games', 'The Fault in Our Stars', 'Six of Crows'],
  },
  {
    name: 'Comedy',
    icon: <Laugh className="h-5 w-5 text-yellow-500" />,
    description:
      'Stories that aim to amuse and entertain through humor, wit, satire, and comedic situations or characters.',
    popularElements: ['Satire', 'Parody', 'Sitcom', 'Dark Humor', 'Slapstick'],
    famousWorks: [
      'Good Omens',
      "The Hitchhiker's Guide to the Galaxy",
      "Bridget Jones's Diary",
    ],
  },
  {
    name: 'Dystopian',
    icon: <Globe className="h-5 w-5 text-red-700" />,
    description:
      'Stories set in imagined societies characterized by suffering, oppression, environmental disaster, or technological control.',
    popularElements: [
      'Totalitarian Government',
      'Rebellion',
      'Surveillance',
      'Environmental Collapse',
      'Class Divide',
    ],
    famousWorks: ['1984', "The Handmaid's Tale", 'Brave New World'],
  },
  {
    name: 'Historical Fantasy',
    icon: <Clock className="h-5 w-5 text-blue-700" />,
    description:
      'Stories that blend historical settings with fantasy elements, often reimagining history with magic or supernatural elements.',
    popularElements: [
      'Magic',
      'Alternative History',
      'Historical Figures',
      'Mythological Elements',
      'Secret Societies',
    ],
    famousWorks: [
      'Jonathan Strange & Mr Norrell',
      'The Golem and the Jinni',
      'Outlander',
    ],
  },
  {
    name: 'Paranormal',
    icon: <Ghost className="h-5 w-5 text-violet-500" />,
    description:
      'Stories featuring supernatural phenomena not explained by scientific understanding, often including ghosts, psychic abilities, or unexplained events.',
    popularElements: [
      'Ghosts',
      'Psychics',
      'Hauntings',
      'Supernatural Creatures',
      'Spiritual Elements',
    ],
    famousWorks: [
      'The Shining',
      'Mexican Gothic',
      'The Haunting of Hill House',
    ],
  },
];

export default function GenresPage() {
  return (
    <div className="py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-heading">
            Explore Story Genres
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover the diverse world of storytelling genres, each offering a
            unique perspective and set of themes. Science Fiction explores
            futuristic visions and advanced technology, while Fantasy invites
            you into magical realms. Romance delves into emotional journeys and
            relationships, and Horror creates an atmosphere of suspense and
            fright. Explore each genre to understand what sets it apart and how
            it shapes the narrative experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {genreData.map((genre, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full theme-gradient-bg opacity-80 flex items-center justify-center">
                    {genre.icon}
                  </div>
                  <CardTitle>{genre.name}</CardTitle>
                </div>
                <CardDescription className="mt-2">
                  {genre.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-sm font-medium">Popular Elements:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {genre.popularElements.map((element, idx) => (
                      <Badge key={idx} variant="secondary">
                        {element}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Famous Works:</span>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {genre.famousWorks.map((work, idx) => (
                      <li key={idx}>• {work}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Genre Combinations Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Genre Combinations
          </h2>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-8">
            The most innovative stories often blend elements from multiple
            genres. Here are some popular genre combinations that have produced
            compelling narratives.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-blue-500" />
                  <span>+</span>
                  <Heart className="h-5 w-5 text-red-500" />
                  Science Fiction Romance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Love stories set against futuristic backdrops, often exploring
                  how technological advancements affect human relationships and
                  emotions.
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Examples:</span> "The Time
                  Traveler's Wife," "Her," "Passengers"
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-500" />
                  <span>+</span>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Fantasy Mystery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detective stories set in magical worlds, where solving crimes
                  involves both deductive reasoning and understanding of
                  supernatural elements.
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Examples:</span> "The City & The
                  City," "Rivers of London," "The Dresden Files"
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-red-700" />
                  <span>+</span>
                  <Baby className="h-5 w-5 text-pink-500" />
                  Dystopian Young Adult
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Coming-of-age stories set in oppressive societies, where young
                  protagonists discover their identities while challenging
                  corrupt systems.
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Examples:</span> "The Hunger
                  Games," "Divergent," "The Maze Runner"
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-brown-500" />
                  <span>+</span>
                  <Ghost className="h-5 w-5 text-violet-500" />
                  Historical Paranormal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stories that weave supernatural elements into historical
                  settings, often exploring how people of different eras might
                  interpret paranormal phenomena.
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Examples:</span> "The
                  Historian," "Lincoln in the Bardo," "The Little Stranger"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Finding Your Genre Section */}
        <div className="bg-muted/30 p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Finding Your Genre
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-6">
            Not sure which genre best fits your story idea? Here are some
            questions to help you decide:
          </p>

          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="p-4 border border-border rounded-md bg-card">
              <p className="font-medium">
                What elements excite you most as a reader or viewer?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Often, we're drawn to write in genres we enjoy consuming.
                Consider what books, movies, or shows have most captivated you.
              </p>
            </div>

            <div className="p-4 border border-border rounded-md bg-card">
              <p className="font-medium">
                What themes are you passionate about exploring?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Different genres lend themselves to different thematic
                explorations. Science fiction often examines technological
                ethics, while fantasy might explore power dynamics.
              </p>
            </div>

            <div className="p-4 border border-border rounded-md bg-card">
              <p className="font-medium">
                What kind of emotional response do you want to evoke?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Horror aims to frighten, romance to create emotional connection,
                comedy to amuse. Consider what feelings you want to stir in your
                readers.
              </p>
            </div>

            <div className="p-4 border border-border rounded-md bg-card">
              <p className="font-medium">
                Remember: Genres are guides, not rigid rules
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                The most innovative stories often transcend traditional genre
                boundaries. Don't be afraid to experiment with combining
                elements from different genres to create something unique.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
