<h1 align="center">
  <img src="public/logo.png" alt="GroqTales Logo" width="150" />
  <br />
  GroqTales
</h1>
<p align="center"><b>AI-Powered Web3 Storytelling Platform</b></p>
<p align="center">Create, share, and own AI-generated stories and comics as NFTs on the Monad blockchain.</p>

<p align="center">
  <img src="https://img.shields.io/github/issues/Drago-03/GroqTales?style=flat-square" alt="Open Issues"/>
  <img src="https://img.shields.io/github/issues-pr/Drago-03/GroqTales?style=flat-square" alt="Open PRs"/>
  <img src="https://img.shields.io/github/license/Drago-03/GroqTales?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/website-groqtales.xyz-0052cc?style=flat-square" alt="Website"/>
  <a href="mailto:mantejarora@gmail.com"><img src="https://img.shields.io/badge/contact-mantejarora%40gmail.com-orange?style=flat-square" alt="Contact Us"/></a>
  <a href="https://discord.gg/JK29FZRm"><img src="https://img.shields.io/discord/1245696768829601812?label=Discord&logo=discord&style=flat-square" alt="Discord"/></a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/SWOC'26-Open%20Source-orange?style=flat-square" alt="SWOC'26"/>
  <img src="https://img.shields.io/badge/OSGC'26-Open%20Source-purple?style=flat-square" alt="OSGC'26"/>
  <img src="https://img.shields.io/badge/ECWOC'26-Open%20Source-ff69b4?style=flat-square" alt="ECWOC'26"/>
  <img src="https://img.shields.io/badge/GSSOC'25-Legacy-lightgrey?style=flat-square" alt="GSSOC'25"/>
  <img src="https://img.shields.io/badge/FOSS%20Hack-Legacy-lightgrey?style=flat-square" alt="FOSS Hack"/>
  <img src="https://img.shields.io/badge/HACKOCTOBER-Legacy-lightgrey?style=flat-square" alt="HACKOCTOBER"/>
  <img src="https://img.shields.io/badge/Indie%20Hub-Main%20Partner-6e5494?style=flat-square" alt="Indie Hub"/>
  <img src="https://img.shields.io/badge/Indie%20Developers%20Society-Community%20Partner-6e5494?style=flat-square" alt="Indie Developers Society"/>
  <img src="https://img.shields.io/badge/Open%20Source%20Community-Welcome-0052cc?style=flat-square" alt="Open Source Community"/>
  <img src="https://img.shields.io/badge/Investment%20Partners-Applications%20Open-0052cc?style=flat-square" alt="Investment Partners"/>
</p>
  <b>Built by Indie Hub</b> ✨
</p>

<div align="center">
  <a href="https://github.com/IndieHub25/GroqTales/stargazers">
    <img src="https://img.shields.io/github/stars/IndieHub25/GroqTales?style=social" alt="Star on GitHub" />
  </a>
  <br />
  ⭐ <b>If you like this project, please consider giving it a star!</b> ⭐
</div>

<br />

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&duration=4000&pause=600&color=F97316&center=true&vCenter=true&width=800&lines=---+AI-powered+Web3+Storytelling+on+the+Monad+Blockchain+---" alt="Animated Divider" />
</p>

---

## 📋 Table of Contents

- [What is GroqTales?](#what-is-groqtales)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [🛠️ Environment Configuration](#️-environment-configuration)
- [🐳 Docker](#-docker)
- [📜 Smart Contracts](#-smart-contracts)
- [🏗️ System Architecture](#️-system-architecture)
- [For Developers](#for-developers)
- [🤝 Contributing](#-contributing)
- [🎨 Spline 3D Guide](#-spline-3d-guide)
- [Roadmap](#roadmap)
- [Contributors](#contributors)
- [Documentation & Architecture](#documentation--architecture)
- [Resources](#resources)
- [License](#license)
- [Security](#security)

---

## What is GroqTales?

GroqTales is an open-source, AI-powered Web3 storytelling platform. Writers and artists can generate
immersive narratives or comic-style stories using Groq AI, then mint and trade them as NFTs on the
Monad blockchain. With a focus on ownership, authenticity, and community, GroqTales bridges the
world of creative writing, generative AI, and decentralized technology.

---

## Features

- **AI-Driven Story & Comic Generation** Use Groq AI to generate stories or comic panel outlines by
  specifying title, genre, setting, characters, and themes. Both text and comic formats are
  supported.
- **Extensive Story Customization (70+ Parameters)** Fine-tune every aspect of your story with
  comprehensive customization across 9 categories:
  - **Characters**: Name, count, traits, age, background, protagonist type
  - **Plot & Structure**: Type, conflict, arc, pacing, ending, plot twists
  - **Setting & World**: Time period, location, world-building depth, atmosphere
  - **Writing Style & Tone**: Voice, tone, style, reading level, mood, dialogue percentage,
    description detail
  - **Themes & Messages**: Primary/secondary themes, moral complexity, social commentary
  - **Content Controls**: Violence, romance, language levels, mature content warnings
  - **Advanced Options**: Chapters, foreshadowing, symbolism, multiple POVs
  - **Inspiration & References**: Similar works, inspired by, tropes to avoid/include
  - **Technical Parameters**: AI creativity slider, model selection
- **NFT Minting on Monad Blockchain** Seamlessly mint your stories as NFTs on Monad (Testnet live,
  Mainnet coming soon). Each NFT proves authenticity, ownership, and collectibility.
- **Community Gallery** Publish your stories publicly, browse the gallery, and interact with other
  creators. Stories can be shared freely or as NFTs.
- **Progressive Disclosure UI** Clean, accordion-based interface with 9 collapsible sections. Keeps
  simple tasks simple while offering advanced options when needed. Only prompt is
  required—everything else is optional!
- **Wallet Integration** Connect with MetaMask, WalletConnect, or Ledger for secure publishing and
  minting. Wallet is required for NFT actions.
- **Real-Time Story Streaming** Watch your story unfold in real-time as Groq AI generates each
  segment.
- **Mobile-Friendly & Responsive UI** Built with modern web technologies for a seamless experience
  on any device.
- **Extensible & Open Source** Modular codebase with clear separation of frontend, backend, and
  smart contract logic. Contributions are welcome!

---

## Tech Stack

- **Frontend:** Next.js, React, TailwindCSS, shadcn/ui
- **Backend:** Node.js, Express.js API (Render), Cloudflare Workers
- **AI:** Groq API (story generation with 70+ configurable parameters), Unsplash API (optional visuals)
- **Blockchain:** Monad SDK, Solidity Smart Contracts
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Hosting:** Cloudflare Pages (frontend), Render (backend API)

---

## Quick Start

```bash
git clone https://github.com/IndieHub25/GroqTales
cd GroqTales
npm install
cp .env.example .env.local
# Add GROQ_API_KEY, UNSPLASH key, Monad network if needed
npm run dev
```

1. Visit [http://localhost:3000](http://localhost:3000)
2. Connect your wallet (optional; required for minting/publishing)
3. Generate your story → Publish or Mint as NFT

See the [Wiki](https://github.com/IndieHub25/GroqTales/wiki) for configuration, environment
variables, and deployment details.

## API Access & Monitoring

Base API URL (Production): `https://groqtales-backend-api.onrender.com`

### Health Checks

For continuous uptime monitoring (e.g., UptimeRobot, Render Health Checks, Datadog), always point to the dedicated, robust liveness probe:

- **Liveness Probe**: `GET /healthz` — Returns an instant `200 OK` bypassing all middleware, rate limiters, and external database latency. Use this for raw "is the server running?" checks.
- **Deep Diagnostics**: `GET /api/health` — Returns extremely detailed server diagnostics including Supabase connectivity, process memory usage, and uptime. (Subject to rate limits).

---

## 🛠️ Environment Configuration

To run this project locally, you must set up your environment variables. Create a file named
`.env.local` in the root directory and populate it with the following keys:

### `.env.local` Setup

| Variable                            | Requirement  | Description                                                          |
| :---------------------------------- | :----------: | :------------------------------------------------------------------- |
| `GROQ_API_KEY`                      | **Required** | Powers the AI story generation engine via Groq LPU.                  |
| `NEXT_PUBLIC_SUPABASE_URL`          | **Required** | Your Supabase project URL for database and authentication.           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | **Required** | Supabase anonymous/public API key for client-side access.            |
| `MONAD_RPC_URL`                     | **Required** | The RPC endpoint for interacting with the Monad Testnet.             |
| `NEXT_PUBLIC_API_URL`               | **Required** | Backend API URL (e.g., `https://groqtales-backend-api.onrender.com`).|
| `NEXT_PUBLIC_UNSPLASH_API_KEY`          |  _Optional_  | API key used for fetching high-quality cover images for stories.     |
| `NEXT_PUBLIC_CONTRACT_ADDR`         | **Required** | The smart contract address for the deployed NFT collection.          |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | **Required** | WalletConnect project ID for wallet integration.                 |

### 🔑 How to get these keys:

1. **Groq API:** Generate a key at [Groq Cloud Console](https://console.groq.com/).
2. **Supabase:** Create a free project at [Supabase](https://supabase.com/) and copy the project URL
   and anon key from Settings → API.
3. **Monad RPC:** Use the official [Monad Testnet docs](https://docs.monad.xyz/) to find the latest
   RPC URL.
4. **Unsplash:** Register an application on the
   [Unsplash Developer Portal](https://unsplash.com/developers).
5. **WalletConnect:** Create a project at [WalletConnect Cloud](https://cloud.walletconnect.com/).

> [!WARNING]  
> Never commit your `.env.local` file to version control. Ensure it is listed in your `.gitignore`
> to prevent leaking sensitive API keys.

---

## 🐳 Docker

GroqTales ships with a production-ready Docker setup. The `docker-compose.yml` spins up all required
services in one command.

### Services

| Service   | Image                                   | Port(s)        | Purpose                              |
| --------- | --------------------------------------- | -------------- | ------------------------------------ |
| `server`  | Built from `Dockerfile` (Node 22)       | `3000`, `3001` | Next.js frontend + Express backend   |

| `anvil`   | `ghcr.io/foundry-rs/foundry:v1.0.0`    | `8545`         | Local Ethereum-compatible dev chain   |

### Quick Start

```bash
# Build & launch everything (Anvil, app)
docker compose up --build

# Run in detached mode
docker compose up --build -d

# View logs
docker compose logs -f server

# Stop all services
docker compose down
```

Your application will be available at **http://localhost:3000** (frontend) and
**http://localhost:3001** (backend API).

### Building for Cloud Deployment

```bash
# Build the image
docker build -t groqtales .

# Cross-platform build (e.g., Mac M-series → amd64 cloud)
docker build --platform=linux/amd64 -t groqtales .

# Push to your registry
docker push myregistry.com/groqtales
```

### Environment Variables

Docker Compose sets these automatically. Override them in a `.env` file or in
`docker-compose.override.yml`:

| Variable                  | Default (Docker)                    |
| ------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL` | `http://supabase:54321`             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key`                |
| `NEXT_PUBLIC_RPC_URL`     | `http://anvil:8545`                 |
| `NODE_ENV`                | `development`                       |

> [!TIP]
> For production, set `NODE_ENV=production` and add your `GROQ_API_KEY`, `MONAD_RPC_URL`, and other
> secrets via environment variables — never bake them into the image.

### References

- [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
- [Docker Compose getting started](https://docs.docker.com/go/get-started-sharing/)

---

## 📜 Smart Contracts

GroqTales utilizes **Solidity-based** smart contracts for NFT minting and ownership management. We
prefer **Hardhat** for local development, compilation, and testing.

### 🛠️ Contract Workflow

- **Contract Location:** `/contracts/`
- **Compile:** `npx hardhat compile`
- **Local Test:** `npx hardhat test`
- **Network:** Monad Testnet (ChainID: `10143`)

> [!WARNING] **Safety Disclaimer:** GroqTales currently operates exclusively on the **Monad
> Testnet**. Do not send real funds (ETH or Mainnet MON) to these contract addresses. Always use a
> dedicated developer/faucet-funded wallet for testing.

---

## 🏗️ System Architecture

GroqTales follows a decoupled architecture ensuring high-speed AI inference and decentralized
ownership.

```mermaid
graph TD
    A[User Interface - Next.js] -->|Prompt with 70+ Params| B[Backend API - Node.js]
    B -->|Inference Request| C[Groq AI LPU Engine]
    C -->|Structured JSON Story| B
    B -->|Metadata| D[Supabase PostgreSQL]
    B -->|IPFS Upload| E[Story/Image Data]
    A -->|Mint NFT| F[Monad Testnet Blockchain]
    F --- G[Smart Contracts - Solidity]
```

---

## For Developers

- **Folder Structure:**
  - `/app` – Next.js application (pages, UI, routes)
  - `/components` – Reusable React components
  - `/contracts` – Solidity smart contracts for NFT minting
  - `/lib` – Utility functions and API integrations
  - `/public` – Static assets
  - `/test` and `/tests` – Test scripts and sample data
  - `/scripts` – Automation and deployment scripts

- **Environment Variables:**
  - `GROQ_API_KEY` – Your Groq AI API key
  - `NEXT_PUBLIC_UNSPLASH_API_KEY` – (Optional) for placeholder visuals
  - `MONAD_RPC_URL` – Monad blockchain RPC endpoint

- **Smart Contract Deployment:**
  - Contracts are written in Solidity and can be deployed to Monad Testnet/Mainnet.
  - See `/contracts` and `/scripts` for deployment instructions.

- **Extending AI Models:**
  - AI logic is modular—add support for new models or prompt types in `/lib` and `/components`.

- **Testing:**
  - Frontend: Use Jest/React Testing Library.
  - Smart Contracts: Use Hardhat/Foundry for Solidity tests.

- **Contributions:**
  - Issues are tagged by difficulty, area, and technology for easy onboarding.
  - Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CONTRIBUTORS.md](CONTRIBUTORS.md) before
    submitting PRs.

---

## 📁 Program Structure

```

GroqTales/
│
├── GroqTales/                # Core domain / main feature-specific logic
│
├── app/                      # Next.js App Router (pages, layouts, routes)
├── components/               # Reusable UI components
├── config/                   # App-wide configuration files
├── deployment/               # Deployment configurations
├── docs/                     # Documentation and guides
├── hooks/                    # Custom React hooks
├── lib/                      # Shared libraries and helper logic
├── models/                   # Data models and schemas
├── path/to/your/             # Placeholder / experimental structure
├── public/                   # Static assets (images, icons, fonts)
├── scripts/                  # Utility and automation scripts
├── server/                   # Backend/server-side logic
├── smart_contracts/          # Blockchain smart contracts
├── src/                      # Core application source code
├── tests/                    # Test cases and testing utilities
├── types/                    # TypeScript type definitions
├── utils/                    # Utility/helper functions
├── wiki/                     # Wiki-related content
├── workers/                  # Background workers / async jobs
│
├── .env.example              # Sample environment variables
├── .eslintrc.js              # ESLint configuration
├── .gitignore                # Git ignored files
├── .hintrc                   # Web hinting configuration
├── .nvmrc                    # Node.js version specification
├── .prettierignore           # Files ignored by Prettier
├── .prettierrc               # Prettier formatting rules
│
├── CHANGELOG.md              # Project change history
├── CODE_OF_CONDUCT.md        # Community code of conduct
├── CONTRIBUTING.md           # Contribution guidelines
├── COOKIE_POLICY.md          # Cookie usage policy
├── LICENSE                   # License information
├── README.md                 # Project overview and instructions
├── SECURITY.md               # Security policy
├── TERMS_OF_SERVICE.md       # Terms of service
├── VERSION                   # Project version file
│
├── build_log.txt             # Build logs
├── foundry.toml              # Foundry configuration (smart contracts)
├── lighthouserc.json         # Lighthouse performance config
├── wrangler.toml             # Cloudflare Pages/Workers configuration
└── MIGRATION-TO-CLOUDFLARE.md # Cloudflare migration guide
```

## 📸 Screenshots

### 🏠 Landing Page

   Displays the GroqTales homepage introducing AI-powered storytelling with options to create, mint, and share stories as NFTs.

<img width="1911" height="920" alt="Screenshot 2026-01-29 182943" src="https://github.com/user-attachments/assets/822cf8a2-4202-4616-9adb-0ea54971c713" />


### ❓ Why GroqTales
 
  Highlights the core features of GroqTales including AI generation, blockchain ownership, and creator community.


<img width="1892" height="824" alt="Screenshot 2026-01-29 183000" src="https://github.com/user-attachments/assets/481d54f5-e0f0-44f4-a980-9a735ea34a67" />


### 🎭 Story Genres

  Presents available storytelling genres such as Science Fiction, Fantasy, and Romance with key themes and elements.


<img width="1910" height="915" alt="Screenshot 2026-01-29 183112" src="https://github.com/user-attachments/assets/07c009f2-603c-48c6-a975-74e3430a434c" />


### 👥 Community Feed

  Showcases the community feed where creators share stories, interact, and discover trending content.


<img width="1911" height="920" alt="Screenshot 2026-01-29 183127" src="https://github.com/user-attachments/assets/0b4e3e2e-58e9-45d9-9a6b-4da57df97df8" />


### 🛒 NFT Marketplace

  Illustrates the NFT marketplace for browsing and uploading comic and text-based story NFTs.

<img width="1913" height="915" alt="Screenshot 2026-01-29 183149" src="https://github.com/user-attachments/assets/a6b4ad86-896d-46b6-a854-31eed5bd0631" />


---

## 🤝 Contributing

📌 New contributors: Please read our [CONTRIBUTING.md](CONTRIBUTING.md) to understand issue labels, templates, and workflows.
GroqTales is community-powered! We welcome all contributions—whether you're a developer, designer, writer, or blockchain enthusiast.


**How You Can Help:**

- Tackle issues labeled `good first issue` (great for newcomers)
- Enhance story-generation logic, outlines, or UI design
- Add support for new AI models or blockchains
- Improve UX (dark mode, mobile layout, galleries)
- Optimize NFT metadata or IPFS workflows
- Write or improve documentation and tests

**What’s in It for You:**

- Build your open-source portfolio
- Feature your work in the contributors section
- Community recognition and GitHub Sponsors eligibility

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 🎨 Spline 3D Guide

For detailed information on how to work with 3D models, performance rules, and our model protection
policy, please refer to the [Spline 3D Contributor Guide](docs/SPLINE_GUIDE.md).

---

## Roadmap

- AI visuals: Integrate Stable Diffusion/DALL·E for comic panels [Phase 2]
- Multilingual story generation [Phase 4]
- Native marketplace for story NFTs [Phase 1]
- Enhanced wallet security & decentralized data storage [Phase 1]
- Mobile app support [Phase 5]
- More blockchain integrations [Open for Discussions on Ideas]

---

## Contributors

We value every contribution! Please read our [CONTRIBUTORS.md](CONTRIBUTORS.md) file before making
your first contribution to understand our guidelines and recognition process.

### Project Contributors

<p align="center">
  <a href="https://github.com/Drago-03/IndieHub25/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=IndieHub25/GroqTales" alt="Contributors" />
  </a>
</p>

Thanks to these amazing people for making GroqTales better!

---

## Documentation & Architecture

### Core Documentation

- **Architecture Overview:** [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Comprehensive system design
  and technical architecture
- **AI Prompt Engineering:** [Wiki/AI-Prompt-Engineering](https://github.com/IndieHub25/GroqTales/wiki/AI-Prompt-Engineering) - AI system prompt parameter reference
- **Pipelines & Automation:** [PIPELINES.md](docs/PIPELINES.md) - Comprehensive guide for the Cloudflare AI ML rankings, SEO RAG loops, and Admin queues
- **Spline 3D Guide:** [SPLINE_GUIDE.md](docs/SPLINE_GUIDE.md) - Essential guide for 3D model
  contributions and protection policy
- **Project Wiki:** [GitHub Wiki](https://github.com/IndieHub25/GroqTales/wiki) - Detailed guides
  and documentation
- **API Documentation:** [Wiki/API](https://github.com/IndieHub25/GroqTales/wiki/API) - Backend API
  reference
- **Smart Contracts:** [Wiki/Blockchain](https://github.com/IndieHub25/GroqTales/wiki/Blockchain) -
  Contract documentation

### System Architecture

- **Frontend Architecture:**
  [ARCHITECTURE.md#frontend](docs/ARCHITECTURE.md#frontend-architecture) - Next.js application
  structure
- **Backend Architecture:** [ARCHITECTURE.md#backend](docs/ARCHITECTURE.md#backend-architecture) -
  API and service design
- **Blockchain Integration:**
  [ARCHITECTURE.md#blockchain](docs/ARCHITECTURE.md#blockchain-architecture) - Web3 and smart
  contract integration
- **AI Integration:** [ARCHITECTURE.md#ai](docs/ARCHITECTURE.md#ai-architecture) - Groq AI
  implementation
- **System Diagrams:** [ARCHITECTURE.md#diagrams](docs/ARCHITECTURE.md#system-diagrams) - Mermaid
  flowcharts and architecture diagrams

### Development Resources

- **Setup Guide:**
  [Wiki/Development-Setup](https://github.com/IndieHub25/GroqTales/wiki/Development-Setup)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute to the project
- **Code of Conduct:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community guidelines
- **Security Policy:** [SECURITY.md](SECURITY.md) - Security practices and vulnerability reporting

---

## Resources

- **Website:** [groqtales.xyz](https://www.groqtales.xyz)
- **Docs:** [Wiki](https://github.com/IndieHub25/GroqTales/wiki)
- **Community Hub:** [GitHub Discussions](https://github.com/IndieHub25/GroqTales/discussions)
- **Discord Support:** [Join our Discord](https://discord.gg/JK29FZRm)

---

## License

Released under the [MIT License](LICENSE).

---

## Security

For vulnerabilities or security-related issues, please refer to [SECURITY.md](SECURITY.md).

---

## Note

_GroqTales currently operates on Monad Testnet for NFT minting. Mainnet support coming soon—stay
tuned!_

---

<h2 align="center">Active At</h2>

<p align="center">
  <img src="public/OSCG26%20Label.jpg%20(1).jpeg" alt="OSCG'26 — Open Source Community Gathering 2026" width="600" />
</p>

---

<p align="center"><i>Support the project by giving us a follow & a Star ⭐️ and share it with others.</i></p>
