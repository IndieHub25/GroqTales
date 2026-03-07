import { test, expect } from '@playwright/test';

test.describe('Story Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create/ai-story');
  });

  test('navigates to story creation page without redirect', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/create\/ai-story/);
  });

  test('story creation page contains prompt input form', async ({ page }) => {
    // Assert specific interactive elements exist
    // Check for the prompt input by placeholder or role
    const promptInput = page.getByPlaceholder(/prompt|describe your story|tell a story/i);
    
    // We expect at least one input/textarea for the prompt
    await expect(promptInput.first()).toBeVisible();
    
    // Check for Generate button
    await expect(page.getByRole('button', { name: /generate|create/i })).toBeVisible();
  });
});
