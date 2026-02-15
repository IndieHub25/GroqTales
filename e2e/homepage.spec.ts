import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads without errors', async ({ page }) => {
    // Verify no uncaught exceptions
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('displays hero section with key elements', async ({ page }) => {
    // Hero tagline
    await expect(page.getByText('The Future of Storytelling')).toBeVisible();

    // Main heading text
    await expect(page.getByText('Create')).toBeVisible();

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
    await expect(page.getByText('Community')).toBeVisible();
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
    await expect(page).toHaveURL(/\/create\/ai-story/);
  });
});
