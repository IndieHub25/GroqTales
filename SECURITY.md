# Security Policy

## Supported Versions

GroqTales follows a rolling support window for the latest minor line plus the two previous patch
releases. Older minors are considered End of Security Support (EoSS) once two newer minor versions
ship or critical architectural changes occur.

| Version | Status               | Support Level                 | Notes                        |
| ------- | -------------------- | ----------------------------- | ---------------------------- |
| 1.2.5   | ✅ Active (Latest)   | Full (features + security)    | Current production release   |
| 1.2.4   | ✅ Active (Previous) | Security & critical bug fixes | Upgrade recommended          |
| 1.2.3   | ✅ Maintained        | Security (critical only)      | Upgrade to 1.2.5             |
| 1.2.2   | ⚠️ Limited Support   | Critical security only        | Upgrade to 1.2.5 recommended |
| < 1.2.0 | ❌ EoSS              | No updates                    | Please upgrade immediately   |

Note: Version 1.2.x series introduces extensive story customization features (70+ parameters),
improved UI/UX, and important bug fixes. Upgrading to 1.2.5 is strongly recommended for the best
experience.

## Reporting a Vulnerability

1. **GitHub Private Reporting (Recommended):** Please report vulnerabilities via the
   **[Security Tab](https://github.com/IndieHub25/GroqTales/security/advisories)** on GitHub. This
   is the most secure way to reach us.
2. **Contact Us Privately:** If you cannot use GitHub, email
   [mantejarora@gmail.com](mailto:mantejarora@gmail.com). For highly sensitive details, you may
   request our PGP public key via email before sending the full report.

## Scope & AI Guidelines

We welcome reports regarding our backend, smart contracts, and AI implementation.

### AI Security Scope (OWASP Top 10 for LLMs)

- **Prompt Injection:** Bypassing system prompts to access internal logic or user data.
- **Insecure Output Handling:** AI-generated content that executes malicious scripts (XSS).
- **Training Data Poisoning:** Malicious manipulation of training data or fine-tuning processes to
  introduce backdoors or biases.
- **Non-Security Issues:** AI "Hallucinations" (making things up) or generic "jailbreaks" that do
  not lead to data exposure are considered **Out-of-Scope**.

### Severity Classification (Updated)

| Severity | Example Impact                                        | Target Fix Window |
| -------- | ----------------------------------------------------- | ----------------- |
| Critical | RCE, **AI-driven data exfiltration**, key compromise  | 24–72h            |
| High     | Auth bypass, **Prompt Injection leaking system logs** | 3–5 days          |
| Medium   | **XSS via AI output**, SSRF                           | < 14 days         |

## Vulnerability Handling Process

1. Report received (private email)
2. Triage & severity classification (see "Severity Classification" under Scope & AI Guidelines) –
   target within 48h
3. Reproduction + impact assessment
4. Patch development on private branch
5. Optional coordinated disclosure window (up to 30 days for High/Critical if complex)
6. Release new patched version & update CHANGELOG (Security section)
7. Public disclosure (if warranted) and reporter credit

### Severity Classification (OWASP Inspired)

| Severity      | Example Impact                                       | Target Fix Window |
| ------------- | ---------------------------------------------------- | ----------------- |
| Critical      | Remote code execution, private key compromise        | 24–72h            |
| High          | Auth bypass, privilege escalation, data exfiltration | 3–5 days          |
| Medium        | Stored XSS, SSRF with limited scope                  | < 14 days         |
| Low           | Reflected XSS, minor info disclosure                 | < 30 days         |
| Informational | Best practice deviation                              | As capacity       |

## Security Practices

- We regularly update dependencies to address known vulnerabilities.
- We employ secure coding practices and conduct code reviews with a focus on security.
- We use automated tools to scan for vulnerabilities in our codebase and dependencies.
- We encourage the use of secure development lifecycle practices among our contributors.

## Protecting Your Data

GroqTales takes the security of user data seriously. We implement industry-standard measures to
protect data both in transit and at rest. If you have concerns about data privacy or security,
please refer to our Privacy & Data Handling documentation (coming soon) or contact us directly.

## Third-Party & Dependency Security

- Dependencies are monitored during routine dependency update cycles.
- High/Critical advisories trigger an expedited patch release.
- Smart contract dependencies and compiler versions are pinned in `foundry.toml` / related config.

If you find a vulnerability in a third-party package we use that directly affects GroqTales, you may
still report it—include the upstream advisory if available.

## Secure Development Guidelines (Abbreviated)

- Principle of Least Privilege in service/API keys
- Input validation & output encoding for user content rendering
- Separation of client/server only data (no secrets in client bundles)
- Avoid dynamic `eval` / code generation in runtime paths
- Rate limiting and basic abuse detection for public endpoints

Full secure coding checklist will be published in future documentation.

Thank you for helping keep GroqTales and our community safe!
