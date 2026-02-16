# GroqTales Developer Onboarding Guide

Welcome to the GroqTales development team! This guide will help you get up and running with the
codebase quickly and efficiently.

## 🚀 Quick Start (5 minutes)

### Prerequisites

- Node.js 18+ and npm 8+
- Git
- VS Code (recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/Drago-03/GroqTales.git
cd GroqTales

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the app running!

## 📁 Project Structure

```
GroqTales/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── components/        # Page-specific components
│   └── (routes)/          # App pages
├── components/            # Shared React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── groq-service.ts   # AI story generation
│   ├── transaction-components.ts # Web3 components
│   └── utils.ts          # Helper functions
├── server/               # Backend API server
│   ├── routes/           # Express.js routes
│   └── backend.js        # Main server file
├── docs/                 # Documentation
├── .github/              # GitHub workflows
└── scripts/              # Build and utility scripts
```

## 🔧 Development Workflow

### 1. Environment Setup

Create `.env.local` with required variables:

```bash
# AI Services
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-key

# Database
MONGODB_URI=your-mongodb-connection
REDIS_URL=your-redis-connection

# Web3 (optional for frontend development)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
```

### 2. Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run backend:dev      # Start backend API server

# Building
npm run build            # Build for production
npm run build:backend    # Build backend only

# Testing & Quality
npm run test             # Run tests
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier

# Deployment
npm run start            # Start production server
npm run start:backend    # Start backend production server
```

### 3. Code Quality Standards

- **TypeScript**: All new code must be TypeScript
- **ESLint**: Follow the configured rules
- **Prettier**: Code is auto-formatted
- **Conventional Commits**: Use semantic commit messages

Example commit:

```bash
git commit -m "feat: add story generation API endpoint"
git commit -m "fix: resolve Web3 connection timeout issue"
git commit -m "docs: update API documentation"
```

## 🏗️ Architecture Overview

### Frontend (Next.js 14)

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + hooks
- **Web3**: Wagmi + Coinbase SDK integration

### Backend (Express.js)

- **API**: RESTful endpoints for stories, NFT, users
- **AI Integration**: Groq API for story generation
- **Database**: MongoDB for data persistence
- **Caching**: Redis for performance optimization

### Deployment

- **Frontend**: Vercel (automatic deployments)
- **Backend**: Render (production API)
- **CI/CD**: GitHub Actions with automated testing

## 🎯 Key Features to Understand

### 1. AI Story Generation

```typescript
// lib/groq-service.ts
export async function generateStoryContent(
  prompt: string,
  model: string,
  options?: GenerationOptions
) {
  // Implementation uses Groq API
}
```

### 2. Web3 Integration

```typescript
// components/providers/web3-provider.tsx
export const Web3Provider = ({ children }) => {
  // Provides wallet connection, NFT minting, etc.
};
```

### 3. Transaction Components

```typescript
// lib/transaction-components.ts
export const TransactionButton = ({ onClick, children }) => {
  // Handles Web3 transactions with error handling
};
```

## 🔍 Common Development Tasks

### Adding a New API Endpoint

1. Create route in `server/routes/`
2. Add to main server in `server/backend.js`
3. Update API documentation
4. Add tests

### Creating a New UI Component

1. Create component in `components/ui/`
2. Follow shadcn/ui patterns
3. Add TypeScript interfaces
4. Export from index file

### Integrating New AI Features

1. Add functions to `lib/groq-service.ts`
2. Create API routes in `app/api/`
3. Add frontend hooks/components
4. Update documentation

## 🧪 Testing Strategy

### Frontend Testing

```bash
# Component tests
npm run test:components

# E2E tests
npm run test:e2e
```

### Backend Testing

```bash
# API endpoint tests
npm run test:api

# Integration tests
npm run test:integration
```

### Manual Testing Checklist

- [ ] Story generation works
- [ ] Wallet connection functions
- [ ] NFT minting process
- [ ] Responsive design
- [ ] Error handling

## 🚨 Troubleshooting

### Common Issues

**Build Failures**

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**TypeScript Errors**

```bash
# Check types
npm run type-check
```

**Linting Issues**

```bash
# Auto-fix most issues
npm run lint:fix
npm run format
```

**Web3 Connection Issues**

- Check wallet is installed
- Verify network configuration
- Ensure API keys are set

### Getting Help

1. Check existing GitHub issues
2. Review documentation in `/docs`
3. Ask in team Discord/Slack
4. Create detailed issue with reproduction steps

## 📚 Learning Resources

### Required Reading

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [Groq API Documentation](https://console.groq.com/docs)

### Recommended Learning

- [React 18 Features](https://react.dev/blog/2022/03/29/react-v18)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Web3 Development Basics](https://ethereum.org/en/developers/)

## 🎯 First Week Goals

### Day 1-2: Setup & Exploration

- [ ] Complete environment setup
- [ ] Run the application locally
- [ ] Explore codebase structure
- [ ] Read key documentation

### Day 3-4: Small Contributions

- [ ] Fix a "good first issue"
- [ ] Improve documentation
- [ ] Add tests to existing code
- [ ] Review team's recent PRs

### Day 5: Feature Development

- [ ] Pick up a feature ticket
- [ ] Implement with tests
- [ ] Create pull request
- [ ] Address code review feedback

## 🤝 Team Collaboration

### Pull Request Process

1. Create feature branch: `git checkout -b feature/story-analytics`
2. Make changes with tests
3. Run quality checks: `npm run lint && npm run test`
4. Create PR with detailed description
5. Address review feedback
6. Merge after approval

### Code Review Guidelines

- Focus on functionality and maintainability
- Check for security issues
- Verify tests are included
- Ensure documentation is updated

### Communication

- **Daily Standups**: Share progress and blockers
- **Sprint Planning**: Estimate and commit to work
- **Retrospectives**: Improve team processes

## 🎉 Welcome to the Team

You're now ready to contribute to GroqTales! Remember:

- Ask questions early and often
- Focus on code quality over speed
- Contribute to documentation
- Help make the codebase better for everyone

Happy coding! 🚀
