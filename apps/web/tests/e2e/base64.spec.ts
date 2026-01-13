import { test, expect } from '@playwright/test';

test.describe('Base64 Converter', () => {
  test('encodes text input to base64', async ({ page }) => {
    await page.goto('/base64?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Base64');

    const inputEditor = page.locator('[data-mode="text"]').first().locator('.cm-content');
    await inputEditor.click();
    await inputEditor.fill('hello');

    const outputEditor = page.locator('[data-mode="text"]').nth(1).locator('.cm-content');
    await expect(outputEditor).toContainText('aGVsbG8=');
  });
});
