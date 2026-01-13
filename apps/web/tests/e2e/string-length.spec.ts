import { test, expect } from '@playwright/test';

test.describe('String Length', () => {
  test('updates word count for input text', async ({ page }) => {
    await page.goto('/string-length?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('String Length');

    const inputEditor = page.locator('[data-mode="text"]').first().locator('.cm-content');
    await inputEditor.click();
    await inputEditor.fill('one two three');

    const wordsCard = page.getByText('Words', { exact: true }).locator('..');
    await expect(wordsCard).toContainText('3');
  });
});
