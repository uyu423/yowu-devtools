import { test, expect } from '@playwright/test';

test.describe('API Tester', () => {
  test('enables send button when URL is provided', async ({ page }) => {
    await page.goto('/api-tester?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('API Tester');

    const sendButton = page.getByRole('button', { name: 'Send' });
    await expect(sendButton).toBeDisabled();

    await page.getByPlaceholder('Enter URL or paste cURL command').fill('https://example.com');
    await expect(sendButton).toBeEnabled();
  });
});
