<!-- markdownlint-enable MD033 -->
# Contributing to GroqTales

<p align="center">
  <img src="https://img.shields.io/badge/SWOC'26-Open%20Source-orange?style=flat-square" alt="SWOC'26"/>
  <img src="https://img.shields.io/badge/GSSOC'25-Legacy-lightgrey?style=flat-square" alt="GSSOC'25"/>
  <img src="https://img.shields.io/badge/FOSS%20Hack-Open%20Source-blue?style=flat-square" alt="FOSS Hack"/>
  <img src="https://img.shields.io/badge/LGM--SOC-Open%20Source-purple?style=flat-square" alt="LGM-SOC"/>
  <img src="https://img.shields.io/badge/MLH-Open%20Source-red?style=flat-square" alt="MLH"/>
  <img src="https://img.shields.io/badge/HackinCodes-Open%20Source-green?style=flat-square" alt="HackinCodes"/>
  <img src="https://img.shields.io/badge/cWoc-Open%20Source-ff69b4?style=flat-square" alt="cWoc"/>
  <img src="https://img.shields.io/badge/Indie%20Hub-Main%20Partner-6e5494?style=flat-square" alt="Indie Hub"/>
  <img src="https://img.shields.io/badge/Open%20Source%20Community-Welcome-0052cc?style=flat-square" alt="Open Source Community"/>
</p>


Thank you for your interest in contributing to **GroqTales**, an AI-powered Web3 storytelling platform! We welcome developers, writers, designers, and blockchain enthusiasts to help us build a creative, open, and secure platform. Please read this guide before getting started.

---

## Table of Contents

- [SWOC'26 Participation](#swoc26-participation)
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Using Issue Templates](#using-issue-templates)
- [Development Setup](#development-setup)
- [Repository Structure & Architecture](#repository-structure--architecture)
- [Coding Guidelines](#coding-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Labeling & Tagging](#labeling--tagging)
- [Documentation](#documentation)
- [Community & Support](#community--support)

---

## SWOC'26 Participation

Are you contributing as part of **Social Winter of Code (SWOC) 2026**? Please see our [SWOC'26.md](./docs/SWOC'26.md) for program-specific guidelines, point systems, and communication channels. 

> **Note:** Ensure your PRs are tagged with the `SWOC'26` label to be eligible for program points.

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for everyone. By participating, you agree to:
- Be respectful of different viewpoints and experiences.
- Gracefully accept constructive criticism.
- Focus on what is best for the community and project.
- Show empathy toward other community members.

For more, see [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

---

## How Can I Contribute?

## 🏷️ How We Categorize Issues

GroqTales uses labels to help contributors understand scope, difficulty, and expectations.

- **Bug** 🐛 – Something is broken or behaving incorrectly
- **Feature** ✨ – New functionality or enhancement
- **Task** 📋 – Documentation, refactors, cleanup, or non-feature work
- **[BIG]** 🚀 – Large, multi-step features requiring discussion
- **Security** 🔐 – Vulnerabilities or sensitive issues (use responsible disclosure)

### Difficulty Labels
- **Easy** – Beginner friendly, good first issue  
- **Medium** – Requires familiarity with the codebase  
- **Hard** – Complex logic or architectural changes


You can contribute in several ways:

- **Reporting Bugs:** Use the `bug_report.md` template and provide detailed steps to reproduce.
- **Suggesting Features:** Use the `feature.md` template to propose new ideas.
- **Code Contributions:** Pick up issues labeled `good first issue`.
- **Web3/Blockchain:** Use the `web3_issue.md` template for Monad/NFT-related contributions.
- **Security:** Use the `security.md` template for vulnerabilities.
- **Documentation:** Help improve the README, Wiki, or code comments.

---

## Using Issue Templates

**Before opening any issue or pull request, you must use the relevant template provided in `.github/ISSUE_TEMPLATE/`.**
Templates include:
- `bug_report.md` – For bugs or unexpected behavior
- `feature.md` – For new features or enhancements
- `web3_issue.md` – For blockchain/NFT/Web3-specific issues
- `security.md` – For vulnerabilities or security concerns
- `basic.md` – For small tasks, typos, or minor requests
- `other.md` – For anything not covered above

## 🧾 When to Use Each Issue Template

Please choose the correct template when opening an issue:

- **Basic Issue** – Small improvements, UI tweaks, or questions
- **Bug Report** – Crashes, broken UI, incorrect behavior
- **Feature Request** – New features or enhancements
- **[BIG] Feature Proposal** – Large ideas needing design discussion
- **Security Report** – Security-related issues (do not disclose publicly)

Choosing the right template helps maintainers respond faster.

**Please fill out all required sections in the template to help us triage and resolve your issue quickly.**

---

## Development Setup

To get started with development:

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/IndieHub25/GroqTales.git](https://github.com/IndieHub25/GroqTales.git)
   cd GroqTales
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```
   
3. **Environment Variables:**
Copy `.env.example` to `.env.local` and fill in:
* `GROQ_API_KEY` – Groq AI key (required)
* `MONAD_RPC_URL` – Monad blockchain endpoint
* `UNSPLASH_API_KEY` – (Optional) for placeholder visuals

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

_Visit [http://localhost:3000](http://localhost:3000) in your browser._


---

## Repository Structure & Architecture
GroqTales is organized for scalability and modularity. Here’s a high-level overview:

```text
GroqTales/
│
├── .github/              # Issue templates, workflows, configs
├── app/                  # Next.js app (pages, routing, layouts)
├── components/           # Reusable React UI components
├── contracts/            # Solidity smart contracts for NFT minting
├── lib/                  # Utilities, API integrations, helpers
├── public/               # Static assets (images, icons, etc.)
├── scripts/              # Deployment and automation scripts
├── test/                 # Contract tests (e.g., Hardhat/Foundry)
├── tests/                # Frontend/backend test cases
├── types/                # Shared TypeScript types/interfaces
├── wiki/                 # Project Wiki and guides
├── .env.example          # Example environment variables
├── package.json          # Project dependencies and scripts
├── tailwind.config.js    # TailwindCSS config
├── README.md             # Main project overview
├── CONTRIBUTING.md       # Contribution guidelines
├── CONTRIBUTORS.md       # List of contributors
├── SECURITY.md           # Security policy
└── ...                   # Other config and support files
```

---

## Architecture Notes

- **Frontend:** Built with Next.js, React, TailwindCSS, and shadcn/ui for a modern, responsive UI.
- **Backend:** Node.js API routes handle authentication, story generation, and blockchain interactions.
- **Blockchain:** Monad SDK and Solidity smart contracts manage NFT minting and ownership.
- **AI:** Groq API powers story and comic generation.
- **Database:** MongoDB stores user data, stories, and metadata.
- **Testing:** Jest/React Testing Library for frontend; Hardhat/Foundry for smart contracts.

---

## Coding Guidelines

- **JavaScript/TypeScript:** Follow the Airbnb Style Guide.
- **React/Next.js:** Use functional components and hooks. Follow Next.js routing and data-fetching conventions.
- **Formatting:** Use Prettier (`npm run format`).
- **Linting:** Use ESLint (`npm run lint`).
- **Commits:** Use descriptive commit messages (Conventional Commits format preferred).
- **Docs:** Update docs and inline comments for all major changes.

---

## Pull Request Process

---

## 🔄 Contribution Workflow

1. Fork the repository
2. Create a feature branch  
   `git checkout -b feature/short-description`
3. Make your changes
4. Commit with a clear message  
   Example: `docs: explain issue labels and templates`
5. Push to your fork
6. Open a Pull Request and link the related issue

Please wait for review before starting large changes.

1. **Fork the repository (do not branch from upstream directly).**
2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/<your-username>/GroqTales.git
   cd GroqTales
   git remote add upstream https://github.com/IndieHub25/GroqTales.git
   ```
   
3. **Synchronize before starting work:**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

4. **Create a feature branch (use descriptive, kebab or slash style):**
   ```bash
   git checkout -b feature/improve-story-generator
   ```

5. **Implement changes (small, atomic commits – use Conventional Commit style if possible).**
6. **Run quality gates locally:**
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

7. **Rebase onto upstream/main before opening PR:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

8. **Push to your fork:**
   ```bash
   git push -u origin feature/improve-story-generator
   ```

9. **Open a Pull Request:**
- Base: `IndieHub25/GroqTales` `main`
- Head: `your-username:feature/improve-story-generator`
- Fill out PR template completely
- Link issue with `Fixes #<number>` where applicable

10. **Address review feedback and keep branch rebased (avoid merge commits).**
11. **PR Merge Policy:** squash or rebase merges preferred; maintainers handle final merge.
12. **After merge:** sync your fork:
    ```bash
    git checkout main
    git fetch upstream
    git merge upstream/main
    git push origin main
    ```

---
The following section describes the full pull request process in detail:

## CI & GitHub Actions
GroqTales uses GitHub Actions to ensure code quality and security.

- **Fork Behavior:** If you are contributing from a fork, some workflows (like Deployments) will not run. This is expected security behavior.
- **"Approve and Run":** Maintainers may need to approve your workflows if you are a first-time contributor. Note that automated PR comments (linting feedback, welcome messages) might not appear on fork PRs due to GitHub security restrictions. Please check the "Files changed" tab and the Actions logs for feedback.
- **Failures:** If a workflow fails with a "Resource not accessible by integration" error, it is likely a permission issue with your fork. A maintainer will review the logs.

---

## Testing Guidelines

- Write or update tests for new features and bug fixes.
- Frontend: Use Jest and React Testing Library.
- Smart Contracts: Use Hardhat or Foundry for Solidity tests.
- Ensure all tests pass before submitting a PR.
- If unsure how to test a feature, ask in your PR or on Discord.

---

## Labeling & Tagging
To ensure your contributions are tracked for **SWOC'26**, use the following labels:
* **Program:** `SWOC'26` (Mandatory for points)
* **Difficulty:** `SWOC-Level-1`, `SWOC-Level-2`, `SWOC-Level-3`
* **Area:** `frontend`, `backend`, `blockchain`, `AI/LLM`
* **Status:** `good first issue`, `help wanted`

---

## Documentation
- Update or add documentation for any new features or changes.
- Add inline comments for complex logic.
- Keep the [Wiki](https://github.com/IndieHub25/GroqTales/wiki) up to date for setup, usage, and architecture.

---

## Community & Support
- **Discord:** [Join our Discord server](https://discord.gg/JK29FZRm) for real-time help and collaboration.
- **Discussions:** Use [GitHub Discussions](https://github.com/IndieHub25/GroqTales/discussions) for ideas and Q&A.
- **Security:** For vulnerabilities, see [SECURITY.md](./SECURITY.md).


---

## ✅ Checklist for Opening a High-Quality Issue

- [ ] Clear title and description
- [ ] Correct issue template used
- [ ] Relevant labels selected
- [ ] Screenshots/logs attached (if applicable)
- [ ] Linked related issues or discussions

Thank you for contributing to GroqTales! If you have any questions, open an issue, ask in Discord, or contact the maintainers directly.

<!-- markdownlint-enable MD033 -->
