import { test, expect } from '@playwright/test';

test.describe('cURL Parser', () => {
  test('parses curl command to request summary', async ({ page }) => {
    await page.goto('/curl?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('cURL');

    const inputEditor = page.locator('[data-mode="text"]').first().locator('.cm-content');
    await inputEditor.click();
    await inputEditor.fill('curl https://example.com?name=John');

    await expect(page.getByText('Request Summary')).toBeVisible();
    await expect(page.getByText('GET')).toBeVisible();
  });
});
