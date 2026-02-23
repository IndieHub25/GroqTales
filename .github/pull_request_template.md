> **IMPORTANT:** Read this entire template and follow it fully.  
> Pull requests that do **not** follow this template may be **closed and marked as blocked** until updated.

---
## Description

**Issue Reference (e.g. Fixes #123):** ---

**Summary of Changes (high-level):**
- What did you change?
- Why was this change needed?
- Which part of the system is impacted (AI, Web, Smart Contracts, Docs, Infra, etc.)?

**Context / Motivation:**
- What problem or use case does this PR solve?
- Any relevant discussion, issue, or design doc links?

---

## Type of Change

Select the relevant categories:

- [ ] **AI / Prompt Logic** (Groq API integration, prompt design, story analysis, or LLM flows)
- [ ] **Web3 / Smart Contracts** (Solidity, Monad SDK, Minting logic, or blockchain infra)
- [ ] **Frontend / UI** (Next.js, Tailwind, shadcn components, accessibility)
- [ ] **Backend / API** (API routes, services, workers, database models, jobs)
- [ ] **DevOps / Tooling** (CI/CD, GitHub Actions, linting/formatting, build tooling)
- [ ] **Documentation** (README, Wiki, architecture docs, code comments)
- [ ] **Testing** (Unit, integration, e2e tests or test infra)
- [ ] **Bug Fix** (Functional or security repair in existing behavior)
- [ ] **Refactor / Cleanup** (No behavior change, only internal improvements)

---

## Technical Checklist

Tick everything that applies. Leave non‑applicable items unchecked.

**AI / Application Logic**
- [ ] I tested story generation end‑to‑end with a valid `GROQ_API_KEY`.
- [ ] I verified that prompts, model names, and parameters are up to date with current Groq APIs.
- [ ] I confirmed that error states and empty responses are handled gracefully (no unhandled exceptions).

**Web3 / Smart Contracts**
- [ ] I verified contract logic on the **Monad Testnet** (deploy + basic flows).
- [ ] I ran the smart contract tests in `smart_contracts` and they passed.
- [ ] I checked for potential reentrancy / overflow / access‑control issues in new or edited contracts.

**Frontend / UX / Accessibility**
- [ ] My changes follow the **Progressive Disclosure** (accordion / step‑based) UX where applicable.
- [ ] I verified the UI in **light and dark mode**.
- [ ] I checked keyboard navigation and focus states for interactive elements I touched.
- [ ] I ensured accessible labels (`aria-*`, alt text) and semantic HTML for new UI.

**Backend / Database**
- [ ] I ran backend startup locally without runtime errors.
- [ ] I validated new API routes with both success and failure cases.
- [ ] I considered database performance (indexes, query filters) for any new queries.
- [ ] I confirmed that new logic respects existing retry/health‑check behavior where relevant.

**Security & Privacy**
- [ ] No API keys, private keys, secrets, or `.env` files are committed.
- [ ] I avoided logging sensitive data (tokens, secrets, full payloads with PII).
- [ ] I considered common web vulnerabilities (XSS, CSRF, SSRF, injection) in my changes.

**Code Quality**
- [ ] I ran `npm run lint` (or equivalent) and resolved reported issues.
- [ ] I ran available tests for the areas I changed (frontend, backend, or contracts).
- [ ] I kept functions/components focused and avoided large “god” modules where possible.
- [ ] I updated or added types where necessary instead of using `any` by default.

---

## Testing Evidence

Describe how you tested these changes. Include commands and logs where possible.

```text
Environment: (e.g. local, Vercel preview, Monad testnet)

Commands:
- npm run lint
- npm run test
- npx hardhat test
- npm run dev

Results / Logs:
- Paste relevant excerpts here…
```

If this PR affects UI flows, also describe the manual test steps you followed.

---

## Visual Proof (for UI / UX changes)

> Required for all visual changes. Attach screenshots or a short screen recording (GIF / video) that clearly shows:
> - Before vs After (if applicable)
> - Different breakpoints (mobile + desktop)
> - Light and dark mode if supported

---

## Contributor Status

Tick all that apply to you for this PR:

- [ ] I am an **open source indie contributor**.
- [ ] I am an **ECWoC’26 contributor**.
- [ ] I am an **OSCG’26 contributor**.
- [ ] I am a **SWOC’26 contributor**.
- [ ] I am a **DSWOC'26 contributor**.

---

## Review & Impact

**Breaking Changes**
- [ ] This PR introduces a breaking change (API / contract / DB).
- [ ] If yes, I have documented migration steps in the description above.

**Dependencies**
- [ ] I added or upgraded dependencies.
- [ ] I explained why these dependencies are needed and checked for license compatibility.

**Backward Compatibility / Migrations**
- [ ] Existing users can continue using GroqTales without manual steps.
- [ ] If a migration is required, steps are clearly described (DB migrations, contract redeploys, etc.).

---

## Final Acknowledgements (Mandatory or will be marked invalid)

You must check all of the following before requesting review. These are **required**:

- [ ] **I confirm that the information and code in this PR are my original work or appropriately credited, and I have the right to contribute them under this repository’s license.**
- [ ] **I understand that by submitting this PR, I take full responsibility and accountability for the changes I am proposing.**
- [ ] **I have read and agree to follow the project’s Code of Conduct, Security Policy, and Contribution Guidelines for all discussions and follow‑up on this PR.**
