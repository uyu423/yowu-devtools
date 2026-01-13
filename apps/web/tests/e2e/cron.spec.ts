import { test, expect } from '@playwright/test';

test.describe('Cron Parser', () => {
  test('renders human readable description', async ({ page }) => {
    await page.goto('/cron?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Cron');

    const cronInput = page.getByPlaceholder('*/5 * * * *');
    await cronInput.fill('*/5 * * * *');

    await expect(page.getByText('Every 5 minutes')).toBeVisible();
  });
});
