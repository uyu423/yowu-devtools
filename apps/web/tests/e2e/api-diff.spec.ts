import { test, expect } from '@playwright/test';

test.describe('API Response Diff', () => {
  test('accepts domains and path inputs', async ({ page }) => {
    await page.goto('/api-diff?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('API Response Diff');

    const domainAInput = page.getByPlaceholder('https://api-a.example.com');
    const domainBInput = page.getByPlaceholder('https://api-b.example.com');
    const pathInput = page.getByPlaceholder('/api/v1/example');

    await domainAInput.fill('https://api-a.example.com');
    await domainBInput.fill('https://api-b.example.com');
    await pathInput.fill('/status');

    await expect(domainAInput).toHaveValue('https://api-a.example.com');
    await expect(domainBInput).toHaveValue('https://api-b.example.com');
    await expect(pathInput).toHaveValue('/status');
    await expect(page.getByRole('button', { name: 'Execute' })).toBeVisible();
  });
});
