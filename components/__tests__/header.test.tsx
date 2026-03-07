/**
 * Header Component Tests
 *
 * Tests for the main site header including navigation,
 * logo rendering, and responsive behavior.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { Header } from '../header';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock next/image (Next.js optimized images don't render in jsdom)
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return React.createElement('img', props);
  },
}));

// Mock framer-motion to render plain DOM elements
jest.mock('framer-motion', () => ({
  motion: {
    header: React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) =>
        React.createElement('header', { ...props, ref })
    ),
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

// Mock Web3 provider
jest.mock('@/components/providers/web3-provider', () => ({
  useWeb3: jest.fn(() => ({ account: null })),
}));

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));

// Mock child components that are complex and not under test
jest.mock('@/components/wallet-connect', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'wallet-connect' }, 'WalletConnect'),
}));

jest.mock('../create-story-dialog', () => ({
  CreateStoryDialog: () => null,
}));

jest.mock('../mode-toggle', () => ({
  ModeToggle: () => React.createElement('div', { 'data-testid': 'mode-toggle' }, 'ModeToggle'),
}));

jest.mock('@/components/user-nav', () => ({
  UserNav: () => React.createElement('div', { 'data-testid': 'user-nav' }, 'UserNav'),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Header', () => {
  it('renders without crashing', () => {
    render(<Header />);
    // Header should be in the document
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('renders the GroqTales logo with correct alt text', () => {
    render(<Header />);
    const logo = screen.getByAltText('GroqTales Logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders the home link', () => {
    render(<Header />);
    const homeLink = screen.getByLabelText('GroqTales home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders primary navigation links', () => {
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: /primary navigation/i });
    expect(nav).toBeInTheDocument();

    // Check for navigable link items
    expect(screen.getByText('Genres')).toBeInTheDocument();
    expect(screen.getByText('NFT Gallery')).toBeInTheDocument();
    expect(screen.getByText('NFT Marketplace')).toBeInTheDocument();
  });

  it('renders the Community dropdown label', () => {
    render(<Header />);
    expect(screen.getByText('Community')).toBeInTheDocument();
  });

  it('renders the Create button', () => {
    render(<Header />);
    const createButton = screen.getByLabelText('Create a new story');
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveTextContent('Create');
  });

  it('renders ModeToggle and UserNav', () => {
    render(<Header />);
    expect(screen.getByTestId('mode-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('user-nav')).toBeInTheDocument();
  });

  it('renders the mobile menu trigger button', () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Open menu');
    expect(menuButton).toBeInTheDocument();
  });
});
