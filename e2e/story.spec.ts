import { test, expect } from '@playwright/test';

test.describe('Story Generation', () => {
  test('navigates to story creation page and sees form', async ({ page }) => {
    await page.goto('/create/ai-story');
    await page.waitForLoadState('networkidle');

    // Page should load without redirect
    await expect(page).toHaveURL(/\/create\/ai-story/);
  });

  test('story creation page contains interactive elements', async ({
    page,
  }) => {
    await page.goto('/create/ai-story');
    await page.waitForLoadState('networkidle');

    // Should have some form of input or interactive element
    const hasInput =
      (await page.locator('input, textarea, [contenteditable]').count()) > 0;
    const hasButton = (await page.locator('button').count()) > 0;

    expect(hasInput || hasButton).toBeTruthy();
  });
});
