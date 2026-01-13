import { test, expect } from '@playwright/test';

test.describe('API Burst Test', () => {
  test('enables run button when URL is provided', async ({ page }) => {
    await page.goto('/api-burst-test?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('API Burst Test');

    const runButton = page.getByRole('button', { name: 'Run' });
    await expect(runButton).toBeDisabled();

    await page
      .getByPlaceholder('https://api.example.com/endpoint')
      .fill('https://example.com');

    await expect(runButton).toBeEnabled();
  });
});
