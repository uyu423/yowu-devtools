import { test, expect } from '@playwright/test';

test.describe('URL Encode/Decode', () => {
  test('encodes input and shows output', async ({ page }) => {
    await page.goto('/url?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('URL');

    const inputEditor = page.locator('[data-mode="text"]').first().locator('.cm-content');
    await inputEditor.click();
    await inputEditor.fill('hello world?');

    const outputEditor = page.locator('[data-mode="text"]').nth(1).locator('.cm-content');
    await expect(outputEditor).toContainText('hello%20world%3F');
  });
});
