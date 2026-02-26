/**
 * StoryCard Component Tests
 *
 * Tests for the story card including rendering of story data,
 * author information, interaction buttons, and genre badges.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { StoryCard } from '../story-card';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => React.createElement('a', { href, ...props }, children),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) =>
        React.createElement('div', { ...props, ref })
    ),
    button: React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<HTMLButtonElement>) =>
        React.createElement('button', { ...props, ref })
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock StoryCommentsDialog
jest.mock('@/components/story-comments-dialog', () => ({
  __esModule: true,
  default: () => null,
}));

// ---------------------------------------------------------------------------
// Test Data
// ---------------------------------------------------------------------------

const mockStory = {
  id: 'story-1',
  title: 'The Quantum Garden',
  content: 'A physicist discovers a garden that grows in quantum superposition...',
  author: 'Alice Chen',
  authorAvatar: '/avatars/alice.png',
  likes: 42,
  views: 1250,
  comments: 8,
  genre: 'Science Fiction',
  coverImage: '/covers/quantum-garden.jpg',
};

const mockStoryWithAuthorObject = {
  id: 'story-2',
  title: 'Whispers in the Mist',
  author: {
    name: 'Bob Writer',
    avatar: '/avatars/bob.png',
    username: 'bobwrites',
  },
  likes: 15,
  genre: 'Mystery',
};

const minimalStory = {
  id: 'story-3',
  title: 'Untitled Draft',
  author: 'Anonymous',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StoryCard', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText('The Quantum Garden')).toBeInTheDocument();
    });

    it('displays the story title', () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText('The Quantum Garden')).toBeInTheDocument();
    });

    it('displays the story content snippet', () => {
      render(<StoryCard story={mockStory} />);
      expect(
        screen.getByText(/A physicist discovers a garden/)
      ).toBeInTheDocument();
    });

    it('displays the author name (string author)', () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
    });

    it('displays the author name (object author)', () => {
      render(<StoryCard story={mockStoryWithAuthorObject} />);
      expect(screen.getByText('Bob Writer')).toBeInTheDocument();
    });

    it('displays the genre badge when genre is provided', () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    });

    it('does not display genre badge when genre is missing', () => {
      render(<StoryCard story={minimalStory} />);
      expect(screen.queryByText('Science Fiction')).not.toBeInTheDocument();
    });
  });

  describe('Metrics', () => {
    it('displays like count', () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('displays view count when present', () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText('1250')).toBeInTheDocument();
    });

    it('displays comment count when present', () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('displays 0 likes when likes is undefined', () => {
      render(<StoryCard story={minimalStory} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Cover Image', () => {
    it('renders cover image when provided', () => {
      render(<StoryCard story={mockStory} />);
      const img = screen.getByAltText('The Quantum Garden');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/covers/quantum-garden.jpg');
    });

    it('renders fallback sparkles icon when no cover image', () => {
      render(<StoryCard story={minimalStory} />);
      // No img tag with story title alt should exist
      expect(screen.queryByAltText('Untitled Draft')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label on the view story button', () => {
      render(<StoryCard story={mockStory} />);
      const viewButton = screen.getByLabelText('View story: The Quantum Garden');
      expect(viewButton).toBeInTheDocument();
    });

    it('has correct aria-label for View NFT button', () => {
      render(<StoryCard story={mockStory} />);
      const nftButton = screen.getByLabelText('View NFT: The Quantum Garden');
      expect(nftButton).toBeInTheDocument();
    });
  });

  describe('Props Behavior', () => {
    it('renders without link wrapper when hideLink is true', () => {
      render(<StoryCard story={mockStory} hideLink />);
      expect(screen.queryByLabelText('View story: The Quantum Garden')).not.toBeInTheDocument();
    });

    it('shows create similar button when showCreateButton is true', () => {
      render(<StoryCard story={mockStory} showCreateButton />);
      const createButton = screen.getByLabelText(
        'Create a story similar to The Quantum Garden'
      );
      expect(createButton).toBeInTheDocument();
    });

    it('does not show create similar button by default', () => {
      render(<StoryCard story={mockStory} />);
      expect(
        screen.queryByLabelText('Create a story similar to The Quantum Garden')
      ).not.toBeInTheDocument();
    });
  });
});
