/**
 * Footer Component Tests
 *
 * Tests for the site footer including social links, navigation sections,
 * copyright text, and brand information.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { Footer } from '../footer';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/link to render a plain anchor
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

// Mock AdminLoginModal (complex child not under test)
jest.mock('../admin-login-modal', () => ({
  AdminLoginModal: () => null,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('displays the GroqTales brand name', () => {
    render(<Footer />);
    expect(screen.getByText('GroqTales', { selector: 'h2' })).toBeInTheDocument();
  });

  it('displays the brand tagline', () => {
    render(<Footer />);
    expect(
      screen.getByText(/empowering creators with ai-driven storytelling/i)
    ).toBeInTheDocument();
  });

  it('renders the current year in copyright', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${currentYear} GroqTales`))).toBeInTheDocument();
  });

  it('renders social media links with correct aria-labels', () => {
    render(<Footer />);
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('X (Twitter)')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

  it('renders Explore navigation section with correct links', () => {
    render(<Footer />);
    const exploreNav = screen.getByRole('navigation', { name: /explore/i });
    expect(exploreNav).toBeInTheDocument();

    const links = ['Genres', 'Community', 'Create Story', 'NFT Gallery', 'Marketplace'];
    for (const linkText of links) {
      expect(screen.getByText(linkText)).toBeInTheDocument();
    }
  });

  it('renders Legal navigation section with correct links', () => {
    render(<Footer />);
    const legalNav = screen.getByRole('navigation', { name: /legal/i });
    expect(legalNav).toBeInTheDocument();

    const links = ['Terms', 'Privacy', 'Cookies', 'Contact'];
    for (const linkText of links) {
      expect(screen.getByText(linkText)).toBeInTheDocument();
    }
  });

  it('renders Resources navigation section', () => {
    render(<Footer />);
    const resourcesNav = screen.getByRole('navigation', { name: /resources/i });
    expect(resourcesNav).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders the Built by section with Indie Hub link', () => {
    render(<Footer />);
    expect(screen.getByText('INDIE HUB')).toBeInTheDocument();
  });

  it('displays the online status indicator', () => {
    render(<Footer />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('shows "Powered by Monad × Groq AI"', () => {
    render(<Footer />);
    expect(screen.getByText('Monad')).toBeInTheDocument();
    expect(screen.getByText('Groq AI')).toBeInTheDocument();
  });
});
