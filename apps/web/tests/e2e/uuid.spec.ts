import { test, expect } from '@playwright/test';

test.describe('UUID Generator', () => {
  test('shows generated UUID output', async ({ page }) => {
    await page.goto('/uuid?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('UUID');

    const codeValue = page.locator('code').first();
    await expect(codeValue).toHaveText(/[0-9a-f-]{36}/);
  });
});
