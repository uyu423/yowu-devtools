import { test, expect } from '@playwright/test';

test.describe('JWT Encoder', () => {
  test('shows encoded token output', async ({ page }) => {
    await page.goto('/jwt-encoder?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('JWT');

    const outputEditor = page.locator('[data-mode="text"]').last().locator('.cm-content');
    await expect(outputEditor).toContainText('.');
  });
});
