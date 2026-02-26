# Testing Double-Minting Prevention

This guide walks through testing the idempotency protections added to prevent accidental double-minting of stories.

## What Was Implemented

1. **Content Hash Tracking** – Each story gets a unique hash before minting (already in `components/story-generator.tsx`)
2. **Minting Status Check** – `/api/mint/check` endpoint validates minting status before allowing new mints
3. **Auth & Rate Limiting** – Each wallet is rate-limited and must be authenticated via NextAuth
4. **Database Scoping** – Mint queries are scoped to `authorAddress` to prevent enumeration attacks
5. **UI Safeguards** – Mint button is disabled during minting; status is shown to user

## Manual Testing Steps

### Test 1: Check Mint Status (Happy Path)

**Precondition:** You're logged in with a connected wallet

**Steps:**
1. Generate a story in the UI
2. Click **Mint Story as NFT**
3. Wait for the mint to complete (you'll see "NFT Minted Successfully!")
4. Refresh the page or close the dialog
5. Generate the same story again (or use the same hash)
6. Click **Mint Story as NFT** again
7. **Expected:** You should see "Already Minted" or "Minting In Progress" message

**Test with curl (if running locally):**

```bash
# 1. First mint check (should return NOT_MINTED or 404)
curl -X POST http://localhost:3000/api/mint/check \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"storyHash":"abc123def456"}'

# Response should be: 
# {"success":true,"status":"NOT_MINTED","message":"Story has not been minted yet"}

# 2. After minting (should return MINTED)
curl -X POST http://localhost:3000/api/mint/check \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"storyHash":"abc123def456"}'

# Response should be:
# {"success":true,"status":"MINTED",...}
```

### Test 2: Rate Limiting

**Steps:**
1. Make 60+ requests to `/api/mint/check` in rapid succession (within 1 minute) from the same wallet
2. After the 60th request, you should receive a 429 (Too Many Requests) response
3. Wait 1 minute for the window to reset
4. Requests should work again

**Test with curl (rate limit test):**

```bash
# This will hit rate limit
for i in {1..65}; do
  curl -X POST http://localhost:3000/api/mint/check \
    -H "Content-Type: application/json" \
    -b "your-session-cookie" \
    -d "{\"storyHash\":\"test$i\"}"
  echo "Request $i"
done
```

### Test 3: Validation & Security

**Steps:**

1. **Missing storyHash:**
```bash
curl -X POST http://localhost:3000/api/mint/check \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{}'
```
Expected: 400 error "Missing or invalid parameter: storyHash"

2. **Unauthenticated request (no session):**
```bash
curl -X POST http://localhost:3000/api/mint/check \
  -H "Content-Type: application/json" \
  -d '{"storyHash":"abc123"}'
```
Expected: 401 error "Unauthorized: Wallet not connected"

3. **Empty string storyHash:**
```bash
curl -X POST http://localhost:3000/api/mint/check \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"storyHash":"   "}'
```
Expected: 400 error (after trimming, empty)

4. **Non-string storyHash:**
```bash
curl -X POST http://localhost:3000/api/mint/check \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"storyHash":{"nested":"object"}}'
```
Expected: 400 error "Missing or invalid parameter: storyHash"

### Test 4: User-Scoped Queries (Security)

**Steps:**
1. Login with **Wallet A**
2. Generate and mint a story
3. Logout, then login with **Wallet B**
4. Try to check the mine status of Wallet A's story (if you know the hash)
5. **Expected:** 404 "Mint record not found" (scoped to current user's wallet, not Wallet A's)

## Integration Testing with Playwright/Cypress

```typescript
// Example Playwright test
test('prevent double-minting same story', async ({ page }) => {
  await page.goto('http://localhost:3000/create/ai-story');
  
  // Login
  await page.click('text=Connect Wallet');
  // ... complete login flow
  
  // Generate story
  await page.fill('[placeholder="Enter your story idea"]', 'Test story');
  await page.click('text=Generate Story');
  await page.locator('text=Story Generated!').waitFor();
  
  // Mint first time
  await page.click('text=Mint Story as NFT');
  await page.locator('text=NFT Minted Successfully!').waitFor();
  
  // Try mint again (same story hash)
  await page.click('text=Mint Story as NFT');
  await page.locator(/Already Minted|Minting In Progress/).waitFor();
  
  // Verify button is disabled or error is shown
  await expect(page.locator('text=Mint Story as NFT')).toBeDisabled();
});
```

## Automated Test Script

Create `tests/double-mint-prevention.test.ts`:

```typescript
import { expect, test } from '@jest/globals';

const API_URL = 'http://localhost:3000/api/mint/check';
const TEST_HASH = 'test-story-hash-' + Date.now();

let sessionCookie: string;

beforeAll(async () => {
  // Setup: Login and capture session
  // (mock or use real auth flow here)
  sessionCookie = 'your-session-cookie-here';
});

test('should allow checking mint status when authenticated', async () => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
    },
    body: JSON.stringify({ storyHash: TEST_HASH }),
  });
  
  expect(response.status).toBe(404); // First check returns 404 (not minted)
});

test('should reject unauthenticated requests', async () => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyHash: TEST_HASH }),
  });
  
  expect(response.status).toBe(401);
  const data = await response.json();
  expect(data.error).toContain('Unauthorized');
});

test('should reject invalid storyHash', async () => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
    },
    body: JSON.stringify({ storyHash: '' }),
  });
  
  expect(response.status).toBe(400);
});

test('should rate-limit after 60 requests/minute', async () => {
  const requests = [];
  for (let i = 0; i < 65; i++) {
    requests.push(
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sessionCookie,
        },
        body: JSON.stringify({ storyHash: `hash-${i}` }),
      })
    );
  }
  
  const responses = await Promise.all(requests);
  const rateLimited = responses.filter(r => r.status === 429);
  
  expect(rateLimited.length).toBeGreaterThan(0);
});
```

## Run Tests

```bash
# Unit tests
npm test -- tests/double-mint-prevention.test.ts

# Integration tests (if using Playwright)
npx playwright test tests/e2e/double-mint.spec.ts

# Manual API testing
bash tests/scripts/test-mint-api.sh
```

## Expected Behaviors Checklist

- [ ] First mint succeeds
- [ ] Subsequent attempts with same hash show "Already Minted"
- [ ] UI button is disabled during minting
- [ ] Unauthenticated requests are rejected (401)
- [ ] Invalid storyHash is rejected (400)
- [ ] Rate limit triggers at 60 req/min (429)
- [ ] Different wallets cannot see each other's mint records
- [ ] Empty/whitespace storyHash is rejected
- [ ] Refresh page doesn't reset mint status

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Ensure you're logged in via NextAuth and session cookie is valid |
| 404 Not Found on first check | This is expected; mint record doesn't exist yet |
| Rate limit not triggering | Check that `RateLimiter.checkRateLimit` is being called in route handler |
| Can see other wallet's mints | Verify `authorAddress: user.wallet.toLowerCase()` is in findOne filter |

## Success Criteria

✅ The double-minting prevention is working correctly when:

1. Same story hash cannot be minted twice
2. Unauthenticated and malformed requests are rejected
3. Rate limiting prevents enumeration attacks
4. User data is properly scoped (can't access other wallets' records)
5. UI provides clear feedback on mint status
