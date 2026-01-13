import { test, expect } from '@playwright/test';

test.describe('Text Diff', () => {
  test('shows diff stats for different inputs', async ({ page }) => {
    await page.goto('/diff?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Text Diff');

    const leftEditor = page.locator('[data-mode="text"]').first().locator('.cm-content');
    const rightEditor = page.locator('[data-mode="text"]').nth(1).locator('.cm-content');

    await leftEditor.click();
    await leftEditor.fill('hello');

    await rightEditor.click();
    await rightEditor.fill('hello world');

    await expect(page.getByText('+6 chars')).toBeVisible();
  });
});
