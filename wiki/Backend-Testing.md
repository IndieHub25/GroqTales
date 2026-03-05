<p align="center">
  <img src="https://www.groqtales.xyz/groq_tales_logo.png" alt="GroqTales Logo" width="150" />
</p>

# Backend Testing & Deployment Readiness

<div align="center">
  <img src="../../public/GroqTales.png" alt="GroqTales Logo" width="300" />
</div>

GroqTales features a comprehensive test suite specifically designed to ensure the Node.js Express backend and Groq AI service are ready for deployment on Render. Since the backend interacts heavily with external APIs (Groq, Supabase) and requires specific file structures, this test suite validates configurations before any deployment goes live.

## Running Tests

To run the backend deployment readiness test, use the following npm command from the root of the project:

```bash
npm run test:backend
```

This will execute the standalone test runner (`scripts/backend-test.js`).

## What the Test Suite Checks

The `test:backend` script verifies 50+ critical assertions across 7 different categories:

1. **File Structure**: Verifies all required backend files exist (`backend.js`, `worker.js`, `routes/*.js`, `render.yaml`, etc.).
2. **Package Configuration**: Checks `server/package.json` for essential dependencies (`express`, `@supabase/supabase-js`, `cors`, etc.) and start scripts.
3. **Render Configuration**: Analyzes `render.yaml` to ensure the `groqtales-backend-api` and `groqtales-worker` services are properly defined, with the required environment variables like `GROQ_API_KEY`.
4. **Groq Service Module**: Verifies `groqService.js` structure:
   - Ensuring `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, and `mistral-saba-24b` are configured.
   - Asserting no deprecated or mock models exist.
   - Validating retry logic and error handling fallbacks.
5. **Route Registration**: Inspects `backend.js` to confirm that all routes (`/api/groq`, `/api/v1/ai`, etc.) and middleware (CORS, rate limiting) are effectively mounted.
6. **No Placeholder Code**: Statically checks route controllers (`ai.js`, `stories.js`) to ensure all legacy placeholder code has been removed and replaced with actual `groqService` API calls.
7. **Worker Pipeline**: Validates `worker.js` contains the required analytics, data cleanup, and content quality check intervals.

## Test Reports & Logs

Every time the test suite is run, a log report is generated and saved locally in the `logs/tests/backend/` directory.

Example log file location:
`logs/tests/backend/report-2023-10-31T12-00-00.000Z.log`

If **even a single test fails**, the script exits with an error code (`1`) to prevent faulty deployments and explicitly saves the breakdown of which assertions failed to the log report.

## CI/CD Integration

The test runner is designed to be completely synchronous and filesystem-based, meaning it does not execute the server or require live network connections to pass. This makes it extremely fast and perfect for CI/CD pipelines.

In the future, this command can be linked to your GitHub Actions or Render build scripts to completely block deployments if structural invariants are violated.

---

[Back to _Sidebar](_Sidebar.md)
