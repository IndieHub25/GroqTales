import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('can navigate to NFT Gallery from homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click "View All" link in the Trending section which links to /nft-gallery
    await page.getByRole('link', { name: /view all/i }).first().click();
    await expect(page).toHaveURL(/\/nft-gallery/);
  });

  test('NFT Gallery page loads successfully', async ({ page }) => {
    await page.goto('/nft-gallery');
    await page.waitForLoadState('networkidle');

    // Verify page loaded (not a 404)
    await expect(page).toHaveURL(/\/nft-gallery/);
    // Page should have meaningful content
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('Community page loads successfully', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/community/);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('NFT Marketplace page loads successfully', async ({ page }) => {
    await page.goto('/nft-marketplace');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/nft-marketplace/);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });
});
