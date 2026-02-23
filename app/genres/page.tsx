'use client';

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
  ChevronDown,
  ChevronUp,
  Lightbulb,
  HelpCircle,
  BookOpen,
  Palette,
  Flame,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Genre images mapping (same as home page)
const genreImages: Record<string, string> = {
  'Science Fiction': 'https://ik.imagekit.io/panmac/tr:f-auto,w-740,pr-true//bcd02f72-b50c-0179-8b4b-5e44f5340bd4/175e79ee-ed99-45d5-846f-5af0be2ab75b/sub%20genre%20guide.webp',
  'Fantasy': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhv_45322WkBmu9o8IvYfcxEXDTbGzORCAgwdP0OF1Zq4izhDr6PT-bkqYj0BJJ_HP02Op2Y0vrNOQlN6tuf0cnu4GwWqprIJrcn89pYY6uiu89gXLr5UXIZ3h6-2HWvO-SjaqzeMRoiXk/s1600/latest.jpg',
  'Romance': 'https://escapetoromance.com/wp-content/uploads/sites/172/2017/05/iStock-503130452.jpg',
  'Horror': 'https://www.nyfa.edu/wp-content/uploads/2022/11/nosferatu.jpg',
  'Mystery': 'https://celadonbooks.com/wp-content/uploads/2020/03/what-is-a-mystery.jpg',
  'Historical Fiction': 'https://celadonbooks.com/wp-content/uploads/2020/03/Historical-Fiction-scaled.jpg',
  'Adventure': 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80',
  'Young Adult': 'https://advicewonders.wordpress.com/wp-content/uploads/2014/09/ya.jpg',
  'Comedy': 'https://motivatevalmorgan.com/wp-content/uploads/2021/01/Why-Comedy-is-a-Genre-for-All.png',
  'Dystopian': 'https://storage.googleapis.com/lr-assets/shared/1655140535-shutterstock_1936124599.jpg',
  'Historical Fantasy': 'https://upload.wikimedia.org/wikipedia/commons/1/16/The_violet_fairy_book_%281906%29_%2814566722029%29.jpg',
  'Paranormal': 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&h=400&fit=crop',
};

// Genre data
const genreData = [
  {
    name: 'Science Fiction',
    icon: <Rocket className="h-5 w-5" />,
    color: 'var(--comic-cyan)',
    description:
      'Stories that explore futuristic concepts, advanced technology, space exploration, time travel, parallel universes, and scientific principles.',
    popularElements: ['AI', 'Space', 'Dystopia', 'Time Travel', 'Robots'],
    famousWorks: ['Dune', 'Neuromancer', 'The Three-Body Problem'],
  },
  {
    name: 'Fantasy',
    icon: <Wand2 className="h-5 w-5" />,
    color: 'var(--comic-purple)',
    description:
      'Stories with magical elements, mythical creatures, supernatural powers, and worlds that operate on different laws of reality.',
    popularElements: ['Magic', 'Dragons', 'Quests', 'Magical Creatures', 'Chosen One'],
    famousWorks: ['The Lord of the Rings', 'A Song of Ice and Fire', 'The Name of the Wind'],
  },
  {
    name: 'Romance',
    icon: <Heart className="h-5 w-5" />,
    color: 'var(--comic-pink)',
    description:
      'Stories focused on romantic relationships, emotional development between characters, and the pursuit of love.',
    popularElements: ['Love Triangle', 'First Love', 'Forbidden Romance', 'Second Chance', 'Slow Burn'],
    famousWorks: ['Pride and Prejudice', 'Outlander', 'The Notebook'],
  },
  {
    name: 'Horror',
    icon: <Skull className="h-5 w-5" />,
    color: 'var(--comic-red)',
    description:
      'Stories designed to frighten, scare, or disgust by creating feelings of dread, terror, and psychological distress.',
    popularElements: ['Ghosts', 'Monsters', 'Psychological', 'Gore', 'Supernatural'],
    famousWorks: ['The Shining', 'Dracula', 'House of Leaves'],
  },
  {
    name: 'Mystery',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'var(--comic-blue)',
    description:
      'Stories centered around solving a crime, uncovering secrets, or explaining unusual events, often featuring detectives or amateur sleuths.',
    popularElements: ['Detective', 'Whodunit', 'Clues', 'Suspense', 'Plot Twist'],
    famousWorks: ['Gone Girl', 'The Girl with the Dragon Tattoo', 'And Then There Were None'],
  },
  {
    name: 'Historical Fiction',
    icon: <Landmark className="h-5 w-5" />,
    color: '#8B6914',
    description:
      'Stories set in the past that blend real historical events or settings with fictional elements and characters.',
    popularElements: ['War', 'Romance', 'Revolution', 'Royalty', 'Cultural Change'],
    famousWorks: ['All the Light We Cannot See', 'Wolf Hall', 'The Book Thief'],
  },
  {
    name: 'Adventure',
    icon: <Compass className="h-5 w-5" />,
    color: 'var(--comic-orange)',
    description:
      'Stories focused on exciting journeys, quests, and expeditions, often featuring physical challenges and discoveries.',
    popularElements: ['Quest', 'Travel', 'Treasure Hunt', 'Survival', 'Exploration'],
    famousWorks: ['The Hobbit', 'Treasure Island', 'Journey to the Center of the Earth'],
  },
  {
    name: 'Young Adult',
    icon: <Baby className="h-5 w-5" />,
    color: '#FF69B4',
    description:
      'Stories targeting teenage readers, often dealing with coming-of-age issues, identity, relationships, and social challenges.',
    popularElements: ['Coming of Age', 'First Love', 'Identity', 'Friendship', 'School'],
    famousWorks: ['The Hunger Games', 'The Fault in Our Stars', 'Six of Crows'],
  },
  {
    name: 'Comedy',
    icon: <Laugh className="h-5 w-5" />,
    color: 'var(--comic-yellow)',
    description:
      'Stories that aim to amuse and entertain through humor, wit, satire, and comedic situations or characters.',
    popularElements: ['Satire', 'Parody', 'Sitcom', 'Dark Humor', 'Slapstick'],
    famousWorks: ['Good Omens', "The Hitchhiker's Guide to the Galaxy", "Bridget Jones's Diary"],
  },
  {
    name: 'Dystopian',
    icon: <Globe className="h-5 w-5" />,
    color: '#4A0E4E',
    description:
      'Stories set in imagined societies characterized by suffering, oppression, environmental disaster, or technological control.',
    popularElements: ['Totalitarian Government', 'Rebellion', 'Surveillance', 'Environmental Collapse', 'Class Divide'],
    famousWorks: ['1984', "The Handmaid's Tale", 'Brave New World'],
  },
  {
    name: 'Historical Fantasy',
    icon: <Clock className="h-5 w-5" />,
    color: '#DAA520',
    description:
      'Stories that blend historical settings with fantasy elements, often reimagining history with magic or supernatural elements.',
    popularElements: ['Magic', 'Alternative History', 'Historical Figures', 'Mythological Elements', 'Secret Societies'],
    famousWorks: ['Jonathan Strange & Mr Norrell', 'The Golem and the Jinni', 'Outlander'],
  },
  {
    name: 'Paranormal',
    icon: <Ghost className="h-5 w-5" />,
    color: '#6B3FA0',
    description:
      'Stories featuring supernatural phenomena not explained by scientific understanding, often including ghosts, psychic abilities, or unexplained events.',
    popularElements: ['Ghosts', 'Psychics', 'Hauntings', 'Supernatural Creatures', 'Spiritual Elements'],
    famousWorks: ['The Shining', 'Mexican Gothic', 'The Haunting of Hill House'],
  },
];

// Quiz questions for "Finding Your Genre"
const quizQuestions = [
  {
    id: 1,
    question: "You find a mysterious door in your basement. What do you do?",
    emoji: "🚪",
    options: [
      { text: "Analyze it with scanning equipment", genre: "Science Fiction" },
      { text: "Cast a revealing spell on it", genre: "Fantasy" },
      { text: "Open it carefully with a detective's eye", genre: "Mystery" },
      { text: "Run — it's probably haunted", genre: "Horror" },
    ],
  },
  {
    id: 2,
    question: "Your ideal Saturday looks like…",
    emoji: "☀️",
    options: [
      { text: "Hiking a mountain trail to the summit", genre: "Adventure" },
      { text: "Binge-reading a love story under a blanket", genre: "Romance" },
      { text: "Watching a stand-up comedy special", genre: "Comedy" },
      { text: "Visiting a historical museum", genre: "Historical Fiction" },
    ],
  },
  {
    id: 3,
    question: "If you could have one superpower…",
    emoji: "⚡",
    options: [
      { text: "Teleportation across the universe", genre: "Science Fiction" },
      { text: "Seeing glimpses of the future", genre: "Paranormal" },
      { text: "Rewriting the past", genre: "Historical Fantasy" },
      { text: "Making anyone laugh uncontrollably", genre: "Comedy" },
    ],
  },
  {
    id: 4,
    question: "The world is ending. What caused it?",
    emoji: "🌍",
    options: [
      { text: "A tyrannical government pushed too far", genre: "Dystopian" },
      { text: "Ancient magic awakened", genre: "Fantasy" },
      { text: "An AI singularity went wrong", genre: "Science Fiction" },
      { text: "Nobody knows — it's eerie and unexplained", genre: "Paranormal" },
    ],
  },
];

// Genre combination data
const combos = [
  {
    icons: [<Rocket key="r" className="h-5 w-5 text-blue-500" />, <Heart key="h" className="h-5 w-5 text-red-500" />],
    name: 'Science Fiction Romance',
    desc: 'Love stories set against futuristic backdrops, exploring how tech affects human relationships.',
    examples: 'The Time Traveler\'s Wife, Her, Passengers',
  },
  {
    icons: [<Wand2 key="w" className="h-5 w-5 text-purple-500" />, <Sparkles key="s" className="h-5 w-5 text-amber-500" />],
    name: 'Fantasy Mystery',
    desc: 'Detective stories in magical worlds, where solving crimes involves supernatural elements.',
    examples: 'Rivers of London, The Dresden Files',
  },
  {
    icons: [<Globe key="g" className="h-5 w-5 text-red-700" />, <Baby key="b" className="h-5 w-5 text-pink-500" />],
    name: 'Dystopian Young Adult',
    desc: 'Coming-of-age stories in oppressive societies where youth challenge corrupt systems.',
    examples: 'The Hunger Games, Divergent, The Maze Runner',
  },
  {
    icons: [<Landmark key="l" className="h-5 w-5 text-amber-700" />, <Ghost key="gh" className="h-5 w-5 text-violet-500" />],
    name: 'Historical Paranormal',
    desc: 'Supernatural elements woven into historical settings across different eras.',
    examples: 'The Historian, Lincoln in the Bardo',
  },
];

export default function GenresPage() {
  const [expandedGenre, setExpandedGenre] = useState<string | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [quizDone, setQuizDone] = useState(false);

  const handleQuizAnswer = (genre: string) => {
    setQuizScores((prev) => ({ ...prev, [genre]: (prev[genre] || 0) + 1 }));
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep((s) => s + 1);
    } else {
      setQuizDone(true);
    }
  };

  const quizResult = quizDone
    ? Object.entries(quizScores).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Fantasy'
    : null;

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizScores({});
    setQuizDone(false);
  };

  return (
    <div className="pt-16 pb-0 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* ═══════════ HERO SECTION ═══════════ */}
        <div className="mb-20 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-black uppercase tracking-[0.3em] text-[var(--comic-purple)] border-2 border-[var(--comic-purple)] bg-[var(--comic-purple)]/10"
            style={{ boxShadow: '3px 3px 0px 0px var(--shadow-color)' }}>
            12 Genres
          </div>
          <h1 className="comic-display text-5xl md:text-7xl text-foreground mb-6">
            Explore Story Genres
          </h1>
          <p className="text-base text-muted-foreground font-bold max-w-2xl mx-auto leading-relaxed">
            Every great story starts with a genre. Discover 12 unique worlds of storytelling —
            from the futuristic frontiers of Sci-Fi to the heart-pounding depths of Horror.
          </p>
        </div>

        {/* ═══════════ GENRE CARDS GRID ═══════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {genreData.map((genre) => {
            const isExpanded = expandedGenre === genre.name;
            const image = genreImages[genre.name];
            return (
              <div
                key={genre.name}
                className="group relative border-4 border-foreground bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: '6px 6px 0px 0px var(--shadow-color)' }}
              >
                {/* Genre image banner */}
                <div className="relative h-44 overflow-hidden">
                  {image && (
                    <img
                      src={image}
                      alt={genre.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <div
                      className="w-9 h-9 flex items-center justify-center text-white border-2 border-white/40"
                      style={{ backgroundColor: genre.color }}
                    >
                      {genre.icon}
                    </div>
                    <h2 className="font-black text-xl uppercase text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>
                      {genre.name}
                    </h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-sm text-muted-foreground font-bold leading-relaxed mb-4">
                    {genre.description}
                  </p>

                  {/* Popular Elements */}
                  <div className="mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-foreground/60">Popular Elements</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {genre.popularElements.map((el) => (
                        <span
                          key={el}
                          className="px-2 py-0.5 text-[11px] font-black uppercase border-2 border-foreground/30 bg-muted text-foreground"
                        >
                          {el}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedGenre(isExpanded ? null : genre.name)}
                    className="flex items-center gap-1 text-xs font-black uppercase text-[var(--comic-purple)] hover:underline mt-2"
                    aria-expanded={isExpanded}
                    aria-controls={`${genre.name.toLowerCase().replace(/\s+/g, '-')}-works`}
                  >
                    {isExpanded ? 'Show Less' : 'Famous Works'}
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {isExpanded && (
                    <ul id={`${genre.name.toLowerCase().replace(/\s+/g, '-')}-works`} className="mt-3 space-y-1.5 text-sm text-muted-foreground border-t-2 border-foreground/10 pt-3">
                      {genre.famousWorks.map((work) => (
                        <li key={work} className="flex items-center gap-2">
                          <BookOpen className="w-3 h-3 text-[var(--comic-red)]" />
                          {work}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Create story button */}
                <div className="px-5 pb-5">
                  <Button asChild className="w-full bg-[var(--comic-red)] text-white border-2 border-foreground font-black uppercase rounded-none text-xs"
                    style={{ boxShadow: '3px 3px 0px 0px var(--shadow-color)' }}>
                    <Link href={`/create/ai-story?genre=${encodeURIComponent(genre.name.toLowerCase())}`}>
                      Write a {genre.name} Story <ArrowRight className="ml-1 w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══════════ GENRE COMBINATIONS ═══════════ */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 mb-4 text-xs font-black uppercase tracking-[0.3em] text-[var(--comic-orange)] border-2 border-[var(--comic-orange)] bg-[var(--comic-orange)]/10"
              style={{ boxShadow: '3px 3px 0px 0px var(--shadow-color)' }}>
              Mix & Match
            </div>
            <h2 className="comic-display text-4xl md:text-5xl text-foreground mb-4">
              Genre Combinations
            </h2>
            <p className="text-base text-muted-foreground font-bold max-w-xl mx-auto">
              The most innovative stories blend multiple genres into something new
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {combos.map((combo) => (
              <div
                key={combo.name}
                className="border-4 border-foreground bg-card p-6 transition-all hover:-translate-y-1"
                style={{ boxShadow: '6px 6px 0px 0px var(--shadow-color)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  {combo.icons[0]}
                  <span className="font-black text-foreground text-lg">+</span>
                  {combo.icons[1]}
                  <h3 className="font-black text-base uppercase ml-1">{combo.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground font-bold mb-3">{combo.desc}</p>
                <p className="text-xs font-bold">
                  <span className="text-[var(--comic-red)] font-black uppercase">Examples:</span>{' '}
                  <span className="text-muted-foreground">{combo.examples}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════ FINDING YOUR GENRE — Interactive Quiz ═══════════ */}
        <div className="mb-24 border-4 border-foreground bg-card overflow-hidden"
          style={{ boxShadow: '8px 8px 0px 0px var(--shadow-color)' }}>

          {/* Header with doodle-like decoration */}
          <div className="relative bg-gradient-to-r from-[var(--comic-purple)] to-[var(--comic-cyan)] p-8 text-white overflow-hidden">
            {/* Decorative doodle circles */}
            <div className="absolute top-4 right-8 w-16 h-16 border-4 border-white/20 rounded-full" />
            <div className="absolute top-12 right-20 w-8 h-8 border-3 border-white/15 rounded-full" />
            <div className="absolute bottom-2 left-12 w-10 h-10 border-3 border-white/10 rounded-full" />
            <div className="absolute top-2 left-1/3 text-4xl opacity-20">🎯</div>
            <div className="absolute bottom-2 right-1/4 text-3xl opacity-[0.15]">🔮</div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-widest mb-3">
                <Lightbulb className="w-3 h-3" />
                Interactive Quiz
              </div>
              <h2 className="comic-display text-3xl md:text-5xl mb-2" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.3)' }}>
                Finding Your Genre
              </h2>
              <p className="text-white/80 font-bold max-w-lg mx-auto text-sm">
                Answer 4 fun questions and discover which genre was made for you!
              </p>
            </div>
          </div>

          {/* Quiz body */}
          <div className="p-8 max-w-2xl mx-auto">
            {!quizDone ? (
              <>
                {/* Progress bar */}
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-xs font-black uppercase text-muted-foreground">
                    Q{quizStep + 1}/{quizQuestions.length}
                  </span>
                  <div className="flex-1 h-3 bg-muted border-2 border-foreground/20 overflow-hidden">
                    <div
                      className="h-full bg-[var(--comic-purple)] transition-all duration-500"
                      style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                {(() => {
                  const currentQ = quizQuestions[quizStep];
                  if (!currentQ) return null;
                  return (
                    <>
                      <div className="text-center mb-8">
                        <span className="text-5xl mb-4 block">{currentQ.emoji}</span>
                        <h3 className="text-xl font-black text-foreground">
                          {currentQ.question}
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentQ.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuizAnswer(opt.genre)}
                            className="p-4 border-3 border-foreground bg-muted/50 text-left font-bold text-sm hover:bg-[var(--comic-purple)]/10 hover:-translate-y-1 hover:border-[var(--comic-purple)] transition-all duration-200 active:translate-y-0"
                            style={{ boxShadow: '4px 4px 0px 0px var(--shadow-color)' }}
                          >
                            <span className="text-[var(--comic-purple)] font-black mr-2">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {opt.text}
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              /* Quiz result */
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block">🎉</span>
                <h3 className="comic-display text-3xl text-foreground mb-3">
                  Your Genre Is…
                </h3>
                <div
                  className="inline-block px-6 py-3 text-xl font-black uppercase text-white mb-6 border-4 border-foreground"
                  style={{
                    backgroundColor: genreData.find((g) => g.name === quizResult)?.color || 'var(--comic-purple)',
                    boxShadow: '4px 4px 0px 0px var(--shadow-color)',
                  }}
                >
                  {quizResult}
                </div>
                <p className="text-muted-foreground font-bold max-w-md mx-auto mb-8">
                  {genreData.find((g) => g.name === quizResult)?.description}
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-[var(--comic-red)] text-white border-3 border-foreground font-black uppercase rounded-none"
                    style={{ boxShadow: '4px 4px 0px 0px var(--shadow-color)' }}
                  >
                    <Link href={`/create/ai-story?genre=${encodeURIComponent((quizResult || '').toLowerCase())}`}>
                      Write a {quizResult} Story <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    onClick={resetQuiz}
                    variant="outline"
                    className="border-3 border-foreground font-black uppercase rounded-none"
                    style={{ boxShadow: '4px 4px 0px 0px var(--shadow-color)' }}
                  >
                    Retake Quiz 🔄
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Decorative bottom tip */}
          <div className="border-t-4 border-foreground/10 bg-muted/30 px-8 py-5 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-[var(--comic-purple)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground font-bold leading-relaxed">
              <span className="text-foreground font-black">Pro tip:</span> Genres are guides, not rigid rules.
              The most innovative stories transcend traditional boundaries — don't be afraid to mix and match!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}