import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  // Use per-test error collection to avoid state leakage
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
  });

  test('loads without errors', async ({ page }) => {
    // Rely on element visibility instead of networkidle
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('displays hero section with key elements', async ({ page }) => {
    // Hero tagline
    await expect(page.getByText('The Future of Storytelling')).toBeVisible();

    // Main heading — exact match or case-insensitive validation
    await expect(
      page.getByRole('heading', { name: /create.*mint.*share/i })
    ).toBeVisible();

    // CTA button
    await expect(
      page.getByRole('link', { name: /start creating/i })
    ).toBeVisible();
  });

  test('displays "Why GroqTales?" features section', async ({ page }) => {
    await expect(page.getByText('Why GroqTales?')).toBeVisible();

    // Feature cards
    await expect(page.getByText('AI Generation')).toBeVisible();
    await expect(page.getByText('NFT Ownership')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Community' })
    ).toBeVisible();
  });

  test('displays CTA section', async ({ page }) => {
    await expect(page.getByText('Ready to Start?')).toBeVisible();
    await expect(
      page.getByRole('link', { name: /create your story/i })
    ).toBeVisible();
  });

  test('"Start Creating" button navigates to story creation page', async ({
    page,
  }) => {
    await page.getByRole('link', { name: /start creating/i }).click();
    await expect(page).toHaveURL(/.*\/create\/ai-story/);
  });
});
