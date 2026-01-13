import { test, expect } from '@playwright/test';

test.describe('Regex Tester', () => {
  test('finds matches for a pattern', async ({ page }) => {
    await page.goto('/regex?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Regex');

    await page.getByPlaceholder('Enter regular expression pattern...').fill('\\d+');

    const testEditor = page.locator('[data-mode="text"]').first().locator('.cm-content');
    await testEditor.click();
    await testEditor.fill('Order 123');

    await expect(page.getByText('Match #1')).toBeVisible();
  });
});
