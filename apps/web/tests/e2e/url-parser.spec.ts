import { test, expect } from '@playwright/test';

test.describe('URL Parser', () => {
  test('parses query parameters', async ({ page }) => {
    await page.goto('/url-parser?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('URL');

    const inputEditor = page.locator('[data-mode="text"]').first().locator('.cm-content');
    await inputEditor.click();
    await inputEditor.fill('https://example.com?name=John%20Doe&age=30');

    await expect(page.getByText('name')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
  });
});
