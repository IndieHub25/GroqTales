# Security Policy

## Supported Versions

GroqTales follows a rolling support window. The latest minor release receives full support (features +
security). The previous minor receives security and critical bug fixes only. Older releases are
considered End of Security Support (EoSS).

| Version | Status               | Support Level                 | Notes                               |
| ------- | -------------------- | ----------------------------- | ----------------------------------- |
| 1.3.5   | ✅ Active (Latest)   | Full (features + security)    | Current production release          |
| 1.3.0   | ✅ Active (Previous) | Security & critical bug fixes | Upgrade recommended                 |
| 1.1.0   | ⚠️ Maintenance       | Critical security only        | Security maintenance — upgrade ASAP |
| < 1.1.0 | ❌ EoSS              | No updates                    | Please upgrade immediately          |

> [!IMPORTANT]
> Version 1.3.x introduces a professional website redesign with Spline 3D hero, neon branding,
> off-chain royalty tracking, WCAG 2.1 AA accessibility compliance, and a complete CSS theme rewrite.
> Upgrading to **1.3.5** is strongly recommended.

## Reporting a Vulnerability

1. **GitHub Private Reporting (Recommended):** Please report vulnerabilities via the
   **[Security Tab](https://github.com/IndieHub25/GroqTales/security/advisories)** on GitHub. This
   is the most secure way to reach us.
2. **Contact Us Privately:** If you cannot use GitHub, email
   [mantejarora@gmail.com](mailto:mantejarora@gmail.com). For highly sensitive details, you may
   request our PGP public key via email before sending the full report.

### What to Include in a Report

- Description of the vulnerability and its potential impact
- Steps to reproduce (including environment details)
- Any proof-of-concept code or screenshots
- Suggested fix, if available

### Response Timeline

| Stage                 | Target SLA |
| --------------------- | ---------- |
| Acknowledgement       | 48 hours   |
| Triage & Severity     | 72 hours   |
| Fix (Critical/High)   | 3–5 days   |
| Fix (Medium/Low)      | 14–30 days |
| Public Disclosure      | Up to 90 days (coordinated) |

## Scope & AI Guidelines

We welcome reports regarding our backend, smart contracts, AI implementation, and frontend security.

### AI Security Scope (OWASP Top 10 for LLMs)

- **Prompt Injection:** Bypassing system prompts to access internal logic or user data.
- **Insecure Output Handling:** AI-generated content that executes malicious scripts (XSS).
- **Training Data Poisoning:** Malicious manipulation of training data or fine-tuning processes to
  introduce backdoors or biases.
- **Sensitive Information Disclosure:** AI outputs that leak API keys, internal paths, or PII.
- **Non-Security Issues:** AI "Hallucinations" (making things up) or generic "jailbreaks" that do
  not lead to data exposure are considered **Out-of-Scope**.

### Severity Classification

| Severity      | Example Impact                                       | Target Fix Window |
| ------------- | ---------------------------------------------------- | ----------------- |
| Critical      | RCE, AI-driven data exfiltration, key compromise     | 24–72 hours       |
| High          | Auth bypass, prompt injection leaking system logs    | 3–5 days          |
| Medium        | XSS via AI output, SSRF with limited scope           | < 14 days         |
| Low           | Reflected XSS, minor info disclosure                 | < 30 days         |
| Informational | Best practice deviation                              | As capacity       |

## Vulnerability Handling Process

1. Report received via GitHub Security Advisory or private email
2. Triage & severity classification — target within 48 hours
3. Reproduction + impact assessment
4. Patch development on private branch
5. Optional coordinated disclosure window (up to 90 days for High/Critical if complex)
6. Release new patched version & update CHANGELOG (Security section)
7. Public disclosure (if warranted) and reporter credit

## Security Practices

- Dependencies are regularly audited via `npm audit` and automated scanning tools
- Secure coding practices enforced through code reviews, ESLint, and TypeScript strict mode
- Helmet.js for HTTP header hardening on all Express routes
- Rate limiting (`express-rate-limit`) on public API endpoints
- Input validation via `express-validator` and Zod schemas
- CORS configured to restrict cross-origin access
- Environment secrets managed via `.env` (never committed to version control)
- WCAG 2.1 AA accessibility compliance reduces attack surface from misleading UI

## Protecting Your Data

GroqTales takes the security of user data seriously. We implement industry-standard measures to
protect data both in transit and at rest:

- HTTPS enforced in production
- MongoDB connections authenticated and encrypted
- JWT-based session management with secure token handling
- No secrets exposed in client-side bundles
- Wallet signatures verified server-side (SIWE)

## Third-Party & Dependency Security

- Dependencies are monitored during routine update cycles and via GitHub Dependabot
- High/Critical advisories trigger an expedited patch release
- Smart contract dependencies and compiler versions are pinned in `foundry.toml` / related config
- React, Next.js, and Express versions are kept within supported LTS windows

If you find a vulnerability in a third-party package we use that directly affects GroqTales, you may
still report it — include the upstream advisory if available.

## Secure Development Guidelines

- Principle of Least Privilege for all service/API keys
- Input validation & output encoding for user content rendering
- Separation of client/server data — no secrets in client bundles
- Avoid dynamic `eval` / code generation in runtime paths
- Rate limiting and abuse detection for public endpoints
- Content Security Policy headers via Helmet
- Server-side rendering (SSR) safe patterns — no raw `document`/`window` access without guards

## Current Technology Stack (Security-Relevant)

| Component      | Technology                | Version    |
| -------------- | ------------------------- | ---------- |
| Runtime        | Node.js                   | ≥ 20.0.0   |
| Framework      | Next.js                   | 14.1.0     |
| Backend        | Express.js                | 5.1.0      |
| Database       | MongoDB (Mongoose)        | 9.x        |
| Auth           | NextAuth.js + SIWE        | 4.x        |
| HTTP Security  | Helmet                    | 8.x        |
| Rate Limiting  | express-rate-limit        | 8.x        |
| Validation     | Zod + express-validator   | 3.x / 7.x  |
| TypeScript     | TypeScript (strict)       | 5.8.x      |

---

Thank you for helping keep GroqTales and our community safe!
